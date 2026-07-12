import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IComplianceRepository } from '../domain/ports/compliance.repository.interface';
import { Consent, ConsentPurpose } from '../entities/consent.entity';
import { PrivacyAuditService } from '../services/privacy-audit.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UpdateConsentsUseCase {
  constructor(
    @Inject('IComplianceRepository')
    private readonly repository: IComplianceRepository,
    private readonly auditService: PrivacyAuditService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async execute(
    userId: string,
    updates: Array<{
      purpose: ConsentPurpose;
      status: boolean;
      version?: string;
    }>,
    ipAddress?: string,
  ): Promise<Consent[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const results: Consent[] = [];
    for (const update of updates) {
      let consent = await this.repository.findConsentByPurpose(
        userId,
        update.purpose,
      );
      if (!consent) {
        consent = new Consent();
        consent.user = user;
        consent.purpose = update.purpose;
      }
      consent.status = update.status;
      consent.version = update.version || '1.0.0';
      const saved = await this.repository.saveConsent(consent);
      results.push(saved);

      await this.auditService.log({
        actorId: userId,
        targetUserId: userId,
        action: `UPDATE_CONSENT_${update.purpose}`,
        purpose: `Consent update: ${update.status ? 'GRANTED' : 'REVOKED'}`,
        ipAddress,
      });
    }

    return results;
  }
}
