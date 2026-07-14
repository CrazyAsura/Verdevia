import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ApplicationType, ApplyForJobInput } from '../dto/graphql/applications-graphql.dto';
import { ApplyForJobUseCase } from '../use-cases/apply-for-job.usecase';

@Resolver(() => ApplicationType)
export class ApplicationsResolver {
  constructor(
    private readonly applyUseCase: ApplyForJobUseCase,
  ) {}

  @Mutation(() => ApplicationType, { description: 'Apply for a job' })
  async applyForJob(@Args('input') input: ApplyForJobInput): Promise<ApplicationType> {
    const app = await this.applyUseCase.execute(input);
    return this.mapApplication(app);
  }

  private mapApplication(app: any): ApplicationType {
    return {
      id: app.id,
      jobId: app.jobId,
      candidateId: app.candidateId,
      status: app.status,
      feedback: app.feedback || undefined,
      job: app.job ? {
        id: app.job.id,
        title: app.job.title,
        description: app.job.description,
        requirements: app.job.requirements || undefined,
        benefits: app.job.benefits || undefined,
        location: app.job.location || undefined,
        salary: app.job.salary ? Number(app.job.salary) : undefined,
        status: app.job.status,
        createdAt: app.job.createdAt,
        updatedAt: app.job.updatedAt,
      } : undefined,
      candidate: app.candidate ? {
        id: app.candidate.id,
        name: app.candidate.name,
        email: app.candidate.email,
        phone: app.candidate.phone || undefined,
        resumeUrl: app.candidate.resumeUrl || undefined,
        linkedInUrl: app.candidate.linkedInUrl || undefined,
        createdAt: app.candidate.createdAt,
        updatedAt: app.candidate.updatedAt,
      } : undefined,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      lgpdConsent: app.lgpdConsent,
      consentVersion: app.consentVersion,
      consentedAt: app.consentedAt,
      retainUntil: app.retainUntil,
    };
  }
}
