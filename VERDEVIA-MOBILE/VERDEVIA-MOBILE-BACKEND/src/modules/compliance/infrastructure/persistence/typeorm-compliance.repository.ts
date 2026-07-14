import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IComplianceRepository } from '../../domain/ports/compliance.repository.interface';
import { Consent } from '../../entities/consent.entity';
import { PrivacyAuditLog } from '../../entities/privacy-audit-log.entity';
import { ComplianceVersion } from '../../entities/compliance-version.entity';

@Injectable()
export class TypeORMComplianceRepository implements IComplianceRepository {
  constructor(
    @InjectRepository(Consent)
    private readonly consentRepo: Repository<Consent>,
    @InjectRepository(PrivacyAuditLog)
    private readonly logRepo: Repository<PrivacyAuditLog>,
    @InjectRepository(ComplianceVersion)
    private readonly versionRepo: Repository<ComplianceVersion>,
  ) {}

  async findConsentsByUserId(userId: string): Promise<Consent[]> {
    return this.consentRepo.find({
      where: { user: { id: userId } },
    });
  }

  async saveConsent(consent: Consent): Promise<Consent> {
    return this.consentRepo.save(consent);
  }

  async saveAuditLog(log: PrivacyAuditLog): Promise<PrivacyAuditLog> {
    return this.logRepo.save(log);
  }

  async findConsentByPurpose(
    userId: string,
    purpose: any,
  ): Promise<Consent | null> {
    return this.consentRepo.findOne({
      where: { user: { id: userId }, purpose },
    });
  }

  // Version history implementation
  async findVersionsByType(type: string): Promise<ComplianceVersion[]> {
    return this.versionRepo.find({
      where: { type },
      order: { publishedAt: 'DESC' },
    });
  }

  async saveVersion(version: ComplianceVersion): Promise<ComplianceVersion> {
    return this.versionRepo.save(version);
  }

  async findVersionById(id: string): Promise<ComplianceVersion | null> {
    return this.versionRepo.findOne({
      where: { id },
    });
  }

  async deactivateAllVersions(type: string): Promise<void> {
    await this.versionRepo.update({ type }, { isActive: false });
  }

  async deleteVersionById(id: string): Promise<void> {
    await this.versionRepo.delete(id);
  }
}
