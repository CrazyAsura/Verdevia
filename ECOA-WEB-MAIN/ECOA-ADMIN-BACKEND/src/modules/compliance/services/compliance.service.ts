import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { Consent, ConsentPurpose } from '../entities/consent.entity';
import { GetConsentsUseCase } from '../use-cases/get-consents.usecase';
import { UpdateConsentsUseCase } from '../use-cases/update-consents.usecase';
import { ExportUserDataUseCase } from '../use-cases/export-user-data.usecase';
import { AnonymizeUserDataUseCase } from '../use-cases/anonymize-user-data.usecase';
import { IComplianceRepository } from '../domain/ports/compliance.repository.interface';
import { ComplianceVersion } from '../entities/compliance-version.entity';

@Injectable()
export class ComplianceService implements OnModuleInit {
  private readonly logger = new Logger('ComplianceService');

  constructor(
    private readonly getConsentsUseCase: GetConsentsUseCase,
    private readonly updateConsentsUseCase: UpdateConsentsUseCase,
    private readonly exportUserDataUseCase: ExportUserDataUseCase,
    private readonly anonymizeUserDataUseCase: AnonymizeUserDataUseCase,
    @Inject('IComplianceRepository')
    private readonly repository: IComplianceRepository,
  ) {}

  // Automatically seed the database with initial legal documents if empty
  async onModuleInit() {
    try {
      const termsList = await this.repository.findVersionsByType('terms');
      const privacyList = await this.repository.findVersionsByType('privacy');
      const cookiesList = await this.repository.findVersionsByType('cookies');

      if (termsList.length === 0) {
        this.logger.log('🌱 Seeding initial Terms of Use in SQLite...');

        const oldTerms = new ComplianceVersion();
        oldTerms.type = 'terms';
        oldTerms.version = '1.0.0';
        oldTerms.content =
          '<h1>Termos e Condições de Uso - ECOA (Antigo)</h1><p>Esta é a primeira versão dos Termos de Uso do aplicativo ECOA.</p>';
        oldTerms.pdfName = 'termos_uso_v1.0.0.pdf';
        oldTerms.isActive = false;
        oldTerms.publishedAt = new Date('2026-01-10T12:00:00.000Z');
        await this.repository.saveVersion(oldTerms);

        const currentTerms = new ComplianceVersion();
        currentTerms.type = 'terms';
        currentTerms.version = '1.0.5';
        currentTerms.content = `<h1>Termos e Condições de Uso - ECOA</h1>
<p>Ao utilizar o aplicativo ECOA, o usuário concorda com a fiscalização colaborativa de ocorrências ambientais. O tratamento de dados segue regras estritas de segurança.</p>
<h2>1. Cadastro e Acesso</h2>
<p>O cadastro exige dados reais de identidade para validação das ocorrências.</p>
<h2>2. Compromisso de Veracidade</h2>
<p>O usuário declara que as fotos e descrições enviadas são verdadeiras e retratam fatos reais ocorridos no local indicado.</p>`;
        currentTerms.pdfName = 'termos_uso_v1.0.5.pdf';
        currentTerms.isActive = true;
        currentTerms.publishedAt = new Date('2026-05-20T10:00:00.000Z');
        await this.repository.saveVersion(currentTerms);
      }

      if (privacyList.length === 0) {
        this.logger.log('🌱 Seeding initial Privacy Policy in SQLite...');

        const privacy = new ComplianceVersion();
        privacy.type = 'privacy';
        privacy.version = '1.0.3';
        privacy.content = `<h1>Política de Privacidade - ECOA</h1>
<p>Esta política descreve como tratamos informações de identificação, fotos de infrações e geolocalização. A base legal principal é o Consentimento do titular.</p>
<h2>2. Coleta de Geolocalização</h2>
<p>Coordenadas exatas são processadas apenas com consentimento ativo do GPS.</p>
<h2>3. Compartilhamento de Dados</h2>
<p>Nenhum dado pessoal identificável é vendido ou compartilhado com terceiros sem consentimento explícito, exceto quando exigido por ordem legal.</p>`;
        privacy.pdfName = 'politica_privacidade_v1.0.3.pdf';
        privacy.isActive = true;
        privacy.publishedAt = new Date('2026-05-15T09:30:00.000Z');
        await this.repository.saveVersion(privacy);
      }

      if (cookiesList.length === 0) {
        this.logger.log('🌱 Seeding initial Cookies Policy in SQLite...');

        const cookies = new ComplianceVersion();
        cookies.type = 'cookies';
        cookies.version = '1.0.1';
        cookies.content = `<h1>Diretrizes de Cookies - ECOA</h1>
<p>Armazenamos tokens de sessão e preferências locais no dispositivo móvel e web para manter a segurança do login ativo e opções de interface.</p>
<h2>1. Cookies de Sessão</h2>
<p>Utilizados exclusivamente para autenticação e integridade do acesso.</p>`;
        cookies.pdfName = 'politica_cookies_v1.0.1.pdf';
        cookies.isActive = true;
        cookies.publishedAt = new Date('2026-05-01T14:00:00.000Z');
        await this.repository.saveVersion(cookies);
      }
    } catch (e) {
      this.logger.error('Failed to seed compliance documents in SQLite:', e);
    }
  }

  // Core functions delegates
  async getConsents(userId: string): Promise<Consent[]> {
    return this.getConsentsUseCase.execute(userId);
  }

  async updateConsents(
    userId: string,
    updates: Array<{
      purpose: ConsentPurpose;
      status: boolean;
      version?: string;
    }>,
    ipAddress?: string,
  ): Promise<Consent[]> {
    return this.updateConsentsUseCase.execute(userId, updates, ipAddress);
  }

  async exportUserData(userId: string, ipAddress?: string): Promise<any> {
    return this.exportUserDataUseCase.execute(userId, ipAddress);
  }

  async anonymizeUserData(
    userId: string,
    ipAddress?: string,
  ): Promise<{ success: boolean }> {
    return this.anonymizeUserDataUseCase.execute(userId, ipAddress);
  }

  // Version management services
  async getVersions(type: string): Promise<ComplianceVersion[]> {
    return this.repository.findVersionsByType(type);
  }

  async publishVersion(
    type: string,
    version: string,
    content: string,
    pdfName: string,
  ): Promise<ComplianceVersion> {
    // 1. Deactivate all existing versions of this type
    await this.repository.deactivateAllVersions(type);

    // 2. Create and save new version
    const newVer = new ComplianceVersion();
    newVer.type = type;
    newVer.version = version;
    newVer.content = content;
    newVer.pdfName = pdfName;
    newVer.isActive = true;
    newVer.publishedAt = new Date();

    return this.repository.saveVersion(newVer);
  }

  async activateVersion(id: string): Promise<ComplianceVersion> {
    const version = await this.repository.findVersionById(id);
    if (!version) {
      throw new Error(`Compliance version with ID ${id} not found.`);
    }

    // 1. Deactivate all versions of this type
    await this.repository.deactivateAllVersions(version.type);

    // 2. Activate this version
    version.isActive = true;
    return this.repository.saveVersion(version);
  }

  async deleteVersion(id: string): Promise<void> {
    const version = await this.repository.findVersionById(id);
    if (!version) {
      throw new Error(`Compliance version with ID ${id} not found.`);
    }

    // 1. Delete version
    await this.repository.deleteVersionById(id);

    // 2. If deleted version was active, set the most recent version of this type to active
    if (version.isActive) {
      const remaining = await this.repository.findVersionsByType(version.type);
      if (remaining.length > 0) {
        remaining[0].isActive = true;
        await this.repository.saveVersion(remaining[0]);
      }
    }
  }
}
