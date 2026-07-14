import { Consent } from '../../entities/consent.entity';
import { PrivacyAuditLog } from '../../entities/privacy-audit-log.entity';
import { ComplianceVersion } from '../../entities/compliance-version.entity';

export interface IComplianceRepository {
  findConsentsByUserId(userId: string): Promise<Consent[]>;
  saveConsent(consent: Consent): Promise<Consent>;
  saveAuditLog(log: PrivacyAuditLog): Promise<PrivacyAuditLog>;
  findConsentByPurpose(
    userId: string,
    purpose: string,
  ): Promise<Consent | null>;

  // Versions
  findVersionsByType(type: string): Promise<ComplianceVersion[]>;
  saveVersion(version: ComplianceVersion): Promise<ComplianceVersion>;
  findVersionById(id: string): Promise<ComplianceVersion | null>;
  deactivateAllVersions(type: string): Promise<void>;
  deleteVersionById(id: string): Promise<void>;
}
