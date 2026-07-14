import { CandidateType, CreateCandidateInput } from '../dto/graphql/candidates-graphql.dto';
import { CreateCandidateUseCase } from '../use-cases/create-candidate.usecase';
import { FindAllCandidatesUseCase } from '../use-cases/find-all-candidates.usecase';
import { FindOneCandidateUseCase } from '../use-cases/find-one-candidate.usecase';
export declare class CandidatesResolver {
    private readonly createUseCase;
    private readonly findAllUseCase;
    private readonly findOneUseCase;
    constructor(createUseCase: CreateCandidateUseCase, findAllUseCase: FindAllCandidatesUseCase, findOneUseCase: FindOneCandidateUseCase);
    candidates(): Promise<CandidateType[]>;
    candidate(id: string): Promise<CandidateType | null>;
    createCandidate(input: CreateCandidateInput): Promise<CandidateType>;
    private mapCandidate;
}
