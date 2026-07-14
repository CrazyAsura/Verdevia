import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { TypeORMJobsRepository } from './infrastructure/persistence/typeorm-jobs.repository';
import { CreateJobUseCase } from './use-cases/create-job.usecase';
import { FindAllJobsUseCase } from './use-cases/find-all-jobs.usecase';
import { FindOneJobUseCase } from './use-cases/find-one-job.usecase';
import { UpdateJobUseCase } from './use-cases/update-job.usecase';
import { DeleteJobUseCase } from './use-cases/delete-job.usecase';
import { JobsController } from './controllers/jobs.controller';
import { JobsResolver } from './resolvers/jobs.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  controllers: [JobsController],
  providers: [
    CreateJobUseCase,
    FindAllJobsUseCase,
    FindOneJobUseCase,
    UpdateJobUseCase,
    DeleteJobUseCase,
    JobsResolver,
    {
      provide: 'IJobsRepository',
      useClass: TypeORMJobsRepository,
    },
  ],
  exports: [
    CreateJobUseCase,
    FindAllJobsUseCase,
    FindOneJobUseCase,
    {
      provide: 'IJobsRepository',
      useClass: TypeORMJobsRepository,
    },
  ],
})
export class JobsModule {}
