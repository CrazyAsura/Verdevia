import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { TypeORMCandidatesRepository } from './infrastructure/persistence/typeorm-candidates.repository';
import { CreateCandidateUseCase } from './use-cases/create-candidate.usecase';
import { FindAllCandidatesUseCase } from './use-cases/find-all-candidates.usecase';
import { FindOneCandidateUseCase } from './use-cases/find-one-candidate.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  providers: [
    CreateCandidateUseCase,
    FindAllCandidatesUseCase,
    FindOneCandidateUseCase,
    {
      provide: 'ICandidatesRepository',
      useClass: TypeORMCandidatesRepository,
    },
  ],
  exports: [
    CreateCandidateUseCase,
    FindAllCandidatesUseCase,
    FindOneCandidateUseCase,
    {
      provide: 'ICandidatesRepository',
      useClass: TypeORMCandidatesRepository,
    },
  ],
})
export class CandidatesModule {}
