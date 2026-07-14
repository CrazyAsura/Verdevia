import { ICandidatesRepository } from '../domain/ports/candidates.repository.interface';
import { Candidate } from '../entities/candidate.entity';
export declare class FindAllCandidatesUseCase {
    private readonly repository;
    constructor(repository: ICandidatesRepository);
    execute(): Promise<Candidate[]>;
}
