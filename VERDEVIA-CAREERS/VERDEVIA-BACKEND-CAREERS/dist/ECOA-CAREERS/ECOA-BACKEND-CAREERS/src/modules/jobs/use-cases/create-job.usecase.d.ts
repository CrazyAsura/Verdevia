import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { CreateJobDto } from '../dto/create-job.dto';
import { Job } from '../entities/job.entity';
export declare class CreateJobUseCase {
    private readonly repository;
    constructor(repository: IJobsRepository);
    execute(dto: CreateJobDto): Promise<Job>;
}
