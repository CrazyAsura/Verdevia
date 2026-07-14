import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
import { UpdateJobDto } from '../dto/update-job.dto';
import { Job } from '../entities/job.entity';

@Injectable()
export class UpdateJobUseCase {
  constructor(
    @Inject('IJobsRepository')
    private readonly repository: IJobsRepository,
  ) {}

  async execute(id: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.repository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return this.repository.update(id, dto);
  }
}
