import { ICandidatesRepository } from '../domain/ports/candidates.repository.interface';
import { Candidate } from '../entities/candidate.entity';
export declare class FindOneCandidateUseCase {
    private readonly repository;
    constructor(repository: ICandidatesRepository);
    execute(id: string): Promise<Candidate>;
}
