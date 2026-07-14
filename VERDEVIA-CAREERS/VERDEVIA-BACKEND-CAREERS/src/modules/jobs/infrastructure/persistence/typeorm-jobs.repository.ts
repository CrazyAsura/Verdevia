import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IJobsRepository } from '../../domain/ports/jobs.repository.interface';
import { Job } from '../../entities/job.entity';

@Injectable()
export class TypeORMJobsRepository implements IJobsRepository {
  constructor(
    @InjectRepository(Job)
    private readonly repo: Repository<Job>,
  ) {}

  async create(job: Partial<Job>): Promise<Job> {
    const newJob = this.repo.create(job);
    return this.repo.save(newJob);
  }

  async update(id: string, job: Partial<Job>): Promise<Job> {
    await this.repo.update(id, job);
    return this.findById(id);
  }

  async findById(id: string): Promise<Job | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<Job[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }

  async save(job: Job): Promise<Job> {
    return this.repo.save(job);
  }
}
