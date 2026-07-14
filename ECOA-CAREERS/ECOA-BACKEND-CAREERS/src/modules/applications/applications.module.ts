import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { TypeORMApplicationsRepository } from './infrastructure/persistence/typeorm-applications.repository';
import { ApplyForJobUseCase } from './use-cases/apply-for-job.usecase';
import { FindAllApplicationsUseCase } from './use-cases/find-all-applications.usecase';
import { UpdateApplicationStatusUseCase } from './use-cases/update-application-status.usecase';
import { ApplicationsController } from './controllers/applications.controller';
import { ApplicationsResolver } from './resolvers/applications.resolver';
import { JobsModule } from '../jobs/jobs.module';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application]),
    JobsModule,
    CandidatesModule,
  ],
  controllers: [ApplicationsController],
  providers: [
    ApplyForJobUseCase,
    FindAllApplicationsUseCase,
    UpdateApplicationStatusUseCase,
    ApplicationsResolver,
    {
      provide: 'IApplicationsRepository',
      useClass: TypeORMApplicationsRepository,
    },
  ],
  exports: [
    ApplyForJobUseCase,
    FindAllApplicationsUseCase,
    UpdateApplicationStatusUseCase,
    {
      provide: 'IApplicationsRepository',
      useClass: TypeORMApplicationsRepository,
    },
  ],
})
export class ApplicationsModule {}
