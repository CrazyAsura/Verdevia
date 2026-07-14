import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICandidatesRepository } from '../../domain/ports/candidates.repository.interface';
import { Candidate } from '../../entities/candidate.entity';

@Injectable()
export class TypeORMCandidatesRepository implements ICandidatesRepository {
  constructor(
    @InjectRepository(Candidate)
    private readonly repo: Repository<Candidate>,
  ) {}

  async create(candidate: Partial<Candidate>): Promise<Candidate> {
    const newCandidate = this.repo.create(candidate);
    return this.repo.save(newCandidate);
  }

  async update(id: string, candidate: Partial<Candidate>): Promise<Candidate> {
    await this.repo.update(id, candidate);
    return this.findById(id);
  }

  async findById(id: string): Promise<Candidate | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findAll(): Promise<Candidate[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }

  async save(candidate: Candidate): Promise<Candidate> {
    return this.repo.save(candidate);
  }
}
