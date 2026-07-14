import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IApplicationsRepository } from '../domain/ports/applications.repository.interface';
import { ApplyForJobDto } from '../dto/apply-for-job.dto';
import { Application } from '../entities/application.entity';
import { CreateCandidateUseCase } from '../../candidates/use-cases/create-candidate.usecase';
import { FindOneJobUseCase } from '../../jobs/use-cases/find-one-job.usecase';

@Injectable()
export class ApplyForJobUseCase {
  constructor(
    @Inject('IApplicationsRepository')
    private readonly repository: IApplicationsRepository,
    private readonly createCandidateUseCase: CreateCandidateUseCase,
    private readonly findOneJobUseCase: FindOneJobUseCase,
  ) {}

  async execute(dto: ApplyForJobDto): Promise<Application> {
    if (!dto.lgpdConsent) {
      throw new BadRequestException(
        'Consentimento LGPD é obrigatório para enviar a candidatura',
      );
    }

    // 1. Verify job exists
    const job = await this.findOneJobUseCase.execute(dto.jobId);
    if (!job) {
      throw new BadRequestException('Vaga inexistente');
    }

    // 2. Resolve or create Candidate
    const candidate = await this.createCandidateUseCase.execute({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      resumeUrl: dto.resumeUrl,
      linkedInUrl: dto.linkedInUrl,
    });

    // 3. Check if candidate already applied for this job
    const existingApps = await this.repository.findByCandidate(candidate.id);
    const alreadyApplied = existingApps.some(app => app.jobId === job.id);
    if (alreadyApplied) {
      throw new BadRequestException('Você já se candidatou para esta vaga');
    }

    const consentedAt = new Date();
    const retainUntil = new Date(consentedAt);
    retainUntil.setMonth(retainUntil.getMonth() + 6);

    // 4. Create application with minimal privacy audit data
    return this.repository.create({
      jobId: job.id,
      candidateId: candidate.id,
      status: 'applied',
      lgpdConsent: true,
      consentVersion: 'careers-privacy-v1',
      consentedAt,
      retainUntil,
    });
  }
}
