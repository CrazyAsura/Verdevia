import { Injectable, Inject } from '@nestjs/common';
import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { Job } from '../entities/job.entity';

@Injectable()
export class FindAllJobsUseCase {
  constructor(
    @Inject('IJobsRepository')
    private readonly repository: IJobsRepository,
  ) {}

  async execute(): Promise<Job[]> {
    return this.repository.findAll();
  }
}
