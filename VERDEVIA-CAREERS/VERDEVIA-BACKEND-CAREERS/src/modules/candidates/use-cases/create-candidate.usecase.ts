import { Injectable, Inject } from '@nestjs/common';
import { ICandidatesRepository } from '../domain/ports/candidates.repository.interface';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { Candidate } from '../entities/candidate.entity';

@Injectable()
export class CreateCandidateUseCase {
  constructor(
    @Inject('ICandidatesRepository')
    private readonly repository: ICandidatesRepository,
  ) {}

  async execute(dto: CreateCandidateDto): Promise<Candidate> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      return this.repository.update(existing.id, dto);
    }
    return this.repository.create(dto);
  }
}
