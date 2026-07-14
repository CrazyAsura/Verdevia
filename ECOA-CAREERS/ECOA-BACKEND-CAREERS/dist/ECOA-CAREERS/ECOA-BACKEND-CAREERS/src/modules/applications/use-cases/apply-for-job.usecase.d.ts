import { IApplicationsRepository } from '../domain/ports/applications.repository.interface';
import { ApplyForJobDto } from '../dto/apply-for-job.dto';
import { Application } from '../entities/application.entity';
import { CreateCandidateUseCase } from '../../candidates/use-cases/create-candidate.usecase';
import { FindOneJobUseCase } from '../../jobs/use-cases/find-one-job.usecase';
export declare class ApplyForJobUseCase {
    private readonly repository;
    private readonly createCandidateUseCase;
    private readonly findOneJobUseCase;
    constructor(repository: IApplicationsRepository, createCandidateUseCase: CreateCandidateUseCase, findOneJobUseCase: FindOneJobUseCase);
    execute(dto: ApplyForJobDto): Promise<Application>;
}
