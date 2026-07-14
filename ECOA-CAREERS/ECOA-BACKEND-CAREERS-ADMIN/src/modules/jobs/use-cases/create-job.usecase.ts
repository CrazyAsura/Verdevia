import { Injectable, Inject } from '@nestjs/common';
import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { CreateJobDto } from '../dto/create-job.dto';
import { Job } from '../entities/job.entity';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject('IJobsRepository')
    private readonly repository: IJobsRepository,
  ) {}

  async execute(dto: CreateJobDto): Promise<Job> {
    return this.repository.create(dto);
  }
}
