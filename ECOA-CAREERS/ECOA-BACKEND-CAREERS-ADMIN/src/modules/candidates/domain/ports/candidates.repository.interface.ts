import { Candidate } from '../../entities/candidate.entity';

export interface ICandidatesRepository {
  create(candidate: Partial<Candidate>): Promise<Candidate>;
  update(id: string, candidate: Partial<Candidate>): Promise<Candidate>;
  findById(id: string): Promise<Candidate | null>;
  findByEmail(email: string): Promise<Candidate | null>;
  findAll(): Promise<Candidate[]>;
  delete(id: string): Promise<boolean>;
  save(candidate: Candidate): Promise<Candidate>;
}
