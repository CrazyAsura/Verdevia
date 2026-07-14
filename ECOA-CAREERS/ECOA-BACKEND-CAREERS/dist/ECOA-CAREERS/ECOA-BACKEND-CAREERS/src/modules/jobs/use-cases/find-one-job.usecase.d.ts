import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { Job } from '../entities/job.entity';
export declare class FindOneJobUseCase {
    private readonly repository;
    constructor(repository: IJobsRepository);
    execute(id: string): Promise<Job>;
}
