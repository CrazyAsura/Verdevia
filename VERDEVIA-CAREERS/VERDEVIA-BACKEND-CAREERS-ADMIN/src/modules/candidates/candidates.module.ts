import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { TypeORMCandidatesRepository } from './infrastructure/persistence/typeorm-candidates.repository';
import { CreateCandidateUseCase } from './use-cases/create-candidate.usecase';
import { FindAllCandidatesUseCase } from './use-cases/find-all-candidates.usecase';
import { FindOneCandidateUseCase } from './use-cases/find-one-candidate.usecase';
import { CandidatesController } from './controllers/candidates.controller';
import { CandidatesResolver } from './resolvers/candidates.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  controllers: [CandidatesController],
  providers: [
    CreateCandidateUseCase,
    FindAllCandidatesUseCase,
    FindOneCandidateUseCase,
    CandidatesResolver,
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
