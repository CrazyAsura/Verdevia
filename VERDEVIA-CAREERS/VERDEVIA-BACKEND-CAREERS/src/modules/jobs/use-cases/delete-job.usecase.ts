import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IJobsRepository } from '../domain/ports/jobs.repository.interface';

@Injectable()
export class DeleteJobUseCase {
  constructor(
    @Inject('IJobsRepository')
    private readonly repository: IJobsRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    const job = await this.repository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return this.repository.delete(id);
  }
}
