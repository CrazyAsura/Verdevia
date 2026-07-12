import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consent } from './entities/consent.entity';
import { ComplianceVersion } from './entities/compliance-version.entity';
import { PrivacyAuditLog } from './entities/privacy-audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consent, ComplianceVersion, PrivacyAuditLog])],
  exports: [TypeOrmModule],
})
export class ComplianceModule {}
