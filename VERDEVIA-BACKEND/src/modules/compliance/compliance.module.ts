import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consent } from './entities/consent.entity';
import { PrivacyAuditLog } from './entities/privacy-audit-log.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../profiles/entities/user-profile.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplianceVersion } from './entities/compliance-version.entity';
import { ComplianceController } from './controllers/compliance.controller';
import { ComplianceService } from './services/compliance.service';
import { PrivacyAuditService } from './services/privacy-audit.service';
import { ComplianceResolver } from './resolvers/compliance.resolver';
import { TypeORMComplianceRepository } from './infrastructure/persistence/typeorm-compliance.repository';
import { GetConsentsUseCase } from './use-cases/get-consents.usecase';
import { UpdateConsentsUseCase } from './use-cases/update-consents.usecase';
import { ExportUserDataUseCase } from './use-cases/export-user-data.usecase';
import { AnonymizeUserDataUseCase } from './use-cases/anonymize-user-data.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consent,
      PrivacyAuditLog,
      User,
      UserProfile,
      Complaint,
      ComplianceVersion,
    ]),
  ],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    PrivacyAuditService,
    ComplianceResolver,
    {
      provide: 'IComplianceRepository',
      useClass: TypeORMComplianceRepository,
    },
    GetConsentsUseCase,
    UpdateConsentsUseCase,
    ExportUserDataUseCase,
    AnonymizeUserDataUseCase,
  ],
  exports: [ComplianceService, PrivacyAuditService],
})
export class ComplianceModule {}
