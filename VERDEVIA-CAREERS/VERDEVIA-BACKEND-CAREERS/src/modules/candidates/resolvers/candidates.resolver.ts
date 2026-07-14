import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CandidateType, CreateCandidateInput } from '../dto/graphql/candidates-graphql.dto';
import { CreateCandidateUseCase } from '../use-cases/create-candidate.usecase';
import { FindAllCandidatesUseCase } from '../use-cases/find-all-candidates.usecase';
import { FindOneCandidateUseCase } from '../use-cases/find-one-candidate.usecase';

@Resolver(() => CandidateType)
export class CandidatesResolver {
  constructor(
    private readonly createUseCase: CreateCandidateUseCase,
    private readonly findAllUseCase: FindAllCandidatesUseCase,
    private readonly findOneUseCase: FindOneCandidateUseCase,
  ) {}

  @Query(() => [CandidateType], { description: 'List all candidates' })
  async candidates(): Promise<CandidateType[]> {
    const candidates = await this.findAllUseCase.execute();
    return candidates.map(c => this.mapCandidate(c));
  }

  @Query(() => CandidateType, { nullable: true, description: 'Get candidate by ID' })
  async candidate(@Args('id', { type: () => ID }) id: string): Promise<CandidateType | null> {
    try {
      const candidate = await this.findOneUseCase.execute(id);
      return this.mapCandidate(candidate);
    } catch {
      return null;
    }
  }

  @Mutation(() => CandidateType, { description: 'Create or update candidate' })
  async createCandidate(@Args('input') input: CreateCandidateInput): Promise<CandidateType> {
    const candidate = await this.createUseCase.execute(input);
    return this.mapCandidate(candidate);
  }

  private mapCandidate(candidate: any): CandidateType {
    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phones: candidate.phones || undefined,
      address: candidate.address || undefined,
      resumeUrl: candidate.resumeUrl || undefined,
      linkedInUrl: candidate.linkedInUrl || undefined,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  }
}
