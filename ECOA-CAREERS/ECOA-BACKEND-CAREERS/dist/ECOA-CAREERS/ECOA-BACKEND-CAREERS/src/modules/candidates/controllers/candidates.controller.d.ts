import { CreateCandidateUseCase } from '../use-cases/create-candidate.usecase';
import { FindAllCandidatesUseCase } from '../use-cases/find-all-candidates.usecase';
import { FindOneCandidateUseCase } from '../use-cases/find-one-candidate.usecase';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
export declare class CandidatesController {
    private readonly createUseCase;
    private readonly findAllUseCase;
    private readonly findOneUseCase;
    constructor(createUseCase: CreateCandidateUseCase, findAllUseCase: FindAllCandidatesUseCase, findOneUseCase: FindOneCandidateUseCase);
    create(dto: CreateCandidateDto): Promise<import("../entities/candidate.entity").Candidate>;
    findAll(): Promise<import("../entities/candidate.entity").Candidate[]>;
    findOne(id: string): Promise<import("../entities/candidate.entity").Candidate>;
}
