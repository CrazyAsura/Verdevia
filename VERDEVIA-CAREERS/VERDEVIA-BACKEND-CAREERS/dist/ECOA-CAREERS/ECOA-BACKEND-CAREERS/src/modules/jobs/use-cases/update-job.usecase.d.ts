import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { UpdateJobDto } from '../dto/update-job.dto';
import { Job } from '../entities/job.entity';
export declare class UpdateJobUseCase {
    private readonly repository;
    constructor(repository: IJobsRepository);
    execute(id: string, dto: UpdateJobDto): Promise<Job>;
}
