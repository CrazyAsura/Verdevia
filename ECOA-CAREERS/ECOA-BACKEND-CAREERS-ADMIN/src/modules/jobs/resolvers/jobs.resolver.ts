import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { JobType, CreateJobInput, UpdateJobInput } from '../dto/graphql/jobs-graphql.dto';
import { CreateJobUseCase } from '../use-cases/create-job.usecase';
import { FindAllJobsUseCase } from '../use-cases/find-all-jobs.usecase';
import { FindOneJobUseCase } from '../use-cases/find-one-job.usecase';
import { UpdateJobUseCase } from '../use-cases/update-job.usecase';
import { DeleteJobUseCase } from '../use-cases/delete-job.usecase';

@Resolver(() => JobType)
export class JobsResolver {
  constructor(
    private readonly createUseCase: CreateJobUseCase,
    private readonly findAllUseCase: FindAllJobsUseCase,
    private readonly findOneUseCase: FindOneJobUseCase,
    private readonly updateUseCase: UpdateJobUseCase,
    private readonly deleteUseCase: DeleteJobUseCase,
  ) {}

  @Query(() => [JobType], { description: 'List all jobs' })
  async jobs(): Promise<JobType[]> {
    const jobs = await this.findAllUseCase.execute();
    return jobs.map(job => this.mapJob(job));
  }

  @Query(() => JobType, { nullable: true, description: 'Get job by ID' })
  async job(@Args('id', { type: () => ID }) id: string): Promise<JobType | null> {
    try {
      const job = await this.findOneUseCase.execute(id);
      return this.mapJob(job);
    } catch {
      return null;
    }
  }

  @Mutation(() => JobType, { description: 'Create a new job' })
  async createJob(@Args('input') input: CreateJobInput): Promise<JobType> {
    const job = await this.createUseCase.execute(input);
    return this.mapJob(job);
  }

  @Mutation(() => JobType, { description: 'Update a job' })
  async updateJob(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateJobInput,
  ): Promise<JobType> {
    const job = await this.updateUseCase.execute(id, input);
    return this.mapJob(job);
  }

  @Mutation(() => Boolean, { description: 'Delete a job' })
  async deleteJob(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.deleteUseCase.execute(id);
  }

  private mapJob(job: any): JobType {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || undefined,
      benefits: job.benefits || undefined,
      location: job.location || undefined,
      salary: job.salary ? Number(job.salary) : undefined,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
