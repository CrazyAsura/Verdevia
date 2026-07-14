import { Injectable, Inject } from '@nestjs/common';
import { ICandidatesRepository } from '../domain/ports/candidates.repository.interface';
import { Candidate } from '../entities/candidate.entity';

@Injectable()
export class FindAllCandidatesUseCase {
  constructor(
    @Inject('ICandidatesRepository')
    private readonly repository: ICandidatesRepository,
  ) {}

  async execute(): Promise<Candidate[]> {
    return this.repository.findAll();
  }
}
