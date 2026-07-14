import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICandidatesRepository } from '../domain/ports/candidates.repository.interface';
import { Candidate } from '../entities/candidate.entity';

@Injectable()
export class FindOneCandidateUseCase {
  constructor(
    @Inject('ICandidatesRepository')
    private readonly repository: ICandidatesRepository,
  ) {}

  async execute(id: string): Promise<Candidate> {
    const candidate = await this.repository.findById(id);
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }
}
