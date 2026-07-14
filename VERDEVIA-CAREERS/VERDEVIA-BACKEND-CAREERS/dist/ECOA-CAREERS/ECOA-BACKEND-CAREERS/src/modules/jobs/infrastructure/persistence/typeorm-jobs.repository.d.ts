import { Repository } from 'typeorm';
import { IJobsRepository } from '../../domain/ports/jobs.repository.interface';
import { Job } from '../../entities/job.entity';
export declare class TypeORMJobsRepository implements IJobsRepository {
    private readonly repo;
    constructor(repo: Repository<Job>);
    create(job: Partial<Job>): Promise<Job>;
    update(id: string, job: Partial<Job>): Promise<Job>;
    findById(id: string): Promise<Job | null>;
    findAll(): Promise<Job[]>;
    delete(id: string): Promise<boolean>;
    save(job: Job): Promise<Job>;
}
