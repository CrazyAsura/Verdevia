import { Job } from '../../entities/job.entity';

export interface IJobsRepository {
  create(job: Partial<Job>): Promise<Job>;
  update(id: string, job: Partial<Job>): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findAll(): Promise<Job[]>;
  delete(id: string): Promise<boolean>;
  save(job: Job): Promise<Job>;
}
