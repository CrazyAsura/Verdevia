import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { JobType } from '../dto/graphql/jobs-graphql.dto';
import { FindAllJobsUseCase } from '../use-cases/find-all-jobs.usecase';
import { FindOneJobUseCase } from '../use-cases/find-one-job.usecase';

@Resolver(() => JobType)
export class JobsResolver {
  constructor(
    private readonly findAllUseCase: FindAllJobsUseCase,
    private readonly findOneUseCase: FindOneJobUseCase,
  ) {}

  @Query(() => [JobType], { description: 'List active public jobs' })
  async jobs(): Promise<JobType[]> {
    const jobs = await this.findAllUseCase.execute();
    return jobs
      .filter((job) => job.status === 'active')
      .map(job => this.mapJob(job));
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
