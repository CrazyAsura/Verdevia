import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ApplicationType, ApplyForJobInput, UpdateApplicationStatusInput } from '../dto/graphql/applications-graphql.dto';
import { ApplyForJobUseCase } from '../use-cases/apply-for-job.usecase';
import { FindAllApplicationsUseCase } from '../use-cases/find-all-applications.usecase';
import { UpdateApplicationStatusUseCase } from '../use-cases/update-application-status.usecase';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';

@Resolver(() => ApplicationType)
@UseGuards(JwtAuthGuard)
export class ApplicationsResolver {
  constructor(
    private readonly applyUseCase: ApplyForJobUseCase,
    private readonly findAllUseCase: FindAllApplicationsUseCase,
    private readonly updateStatusUseCase: UpdateApplicationStatusUseCase,
  ) {}

  @Query(() => [ApplicationType], { description: 'List all applications' })
  async applications(): Promise<ApplicationType[]> {
    const apps = await this.findAllUseCase.execute();
    return apps.map(app => this.mapApplication(app));
  }

  @Mutation(() => ApplicationType, { description: 'Apply for a job' })
  async applyForJob(@Args('input') input: ApplyForJobInput): Promise<ApplicationType> {
    const app = await this.applyUseCase.execute(input);
    return this.mapApplication(app);
  }

  @Mutation(() => ApplicationType, { description: 'Update application status' })
  async updateApplicationStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateApplicationStatusInput,
  ): Promise<ApplicationType> {
    const app = await this.updateStatusUseCase.execute(id, input);
    return this.mapApplication(app);
  }

  private mapApplication(app: any): ApplicationType {
    const consentedAt = app.consentedAt || app.createdAt;
    const retainUntil = app.retainUntil || this.defaultRetainUntil(consentedAt);

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
        phones: app.candidate.phones || undefined,
        address: app.candidate.address || undefined,
        portfolioUrl: app.candidate.portfolioUrl || undefined,
        resumeUrl: app.candidate.resumeUrl || undefined,
        linkedInUrl: app.candidate.linkedInUrl || undefined,
        createdAt: app.candidate.createdAt,
        updatedAt: app.candidate.updatedAt,
      } : undefined,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      lgpdConsent: app.lgpdConsent ?? true,
      consentVersion: app.consentVersion || 'careers-privacy-v1',
      consentedAt,
      retainUntil,
    };
  }

  private defaultRetainUntil(baseDate: Date): Date {
    const retainUntil = new Date(baseDate);
    retainUntil.setMonth(retainUntil.getMonth() + 6);
    return retainUntil;
  }
}
