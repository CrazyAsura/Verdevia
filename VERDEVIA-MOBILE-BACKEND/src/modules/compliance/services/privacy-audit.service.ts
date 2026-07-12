import { Injectable, Inject } from '@nestjs/common';
import { IComplianceRepository } from '../domain/ports/compliance.repository.interface';
import { PrivacyAuditLog } from '../entities/privacy-audit-log.entity';

@Injectable()
export class PrivacyAuditService {
  constructor(
    @Inject('IComplianceRepository')
    private readonly repository: IComplianceRepository,
  ) {}

  async log(params: {
    actorId: string;
    targetUserId: string;
    action: string;
    purpose: string;
    ipAddress?: string;
  }): Promise<PrivacyAuditLog> {
    const log = new PrivacyAuditLog();
    log.actorId = params.actorId;
    log.targetUserId = params.targetUserId;
    log.action = params.action;
    log.purpose = params.purpose;
    log.ipAddress = params.ipAddress || 'unknown';
    return this.repository.saveAuditLog(log);
  }
}
