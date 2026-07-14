import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { Job } from '../entities/job.entity';
export declare class FindAllJobsUseCase {
    private readonly repository;
    constructor(repository: IJobsRepository);
    execute(): Promise<Job[]>;
}
