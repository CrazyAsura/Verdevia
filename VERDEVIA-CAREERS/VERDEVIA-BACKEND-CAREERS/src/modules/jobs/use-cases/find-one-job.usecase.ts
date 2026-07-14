import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { Job } from '../entities/job.entity';

@Injectable()
export class FindOneJobUseCase {
  constructor(
    @Inject('IJobsRepository')
    private readonly repository: IJobsRepository,
  ) {}

  async execute(id: string): Promise<Job> {
    const job = await this.repository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }
}
