import { ICandidatesRepository } from '../domain/ports/candidates.repository.interface';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { Candidate } from '../entities/candidate.entity';
export declare class CreateCandidateUseCase {
    private readonly repository;
    constructor(repository: ICandidatesRepository);
    execute(dto: CreateCandidateDto): Promise<Candidate>;
}
