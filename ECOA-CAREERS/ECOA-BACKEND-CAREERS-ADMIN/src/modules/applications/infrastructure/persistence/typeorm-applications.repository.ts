import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IApplicationsRepository } from '../../domain/ports/applications.repository.interface';
import { Application } from '../../entities/application.entity';

@Injectable()
export class TypeORMApplicationsRepository implements IApplicationsRepository {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
  ) {}

  async create(application: Partial<Application>): Promise<Application> {
    const newApp = this.repo.create(application);
    const saved = await this.repo.save(newApp);
    return this.findById(saved.id);
  }

  async update(id: string, application: Partial<Application>): Promise<Application> {
    await this.repo.update(id, application);
    return this.findById(id);
  }

  async findById(id: string): Promise<Application | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['job', 'candidate'],
    });
  }

  async findAll(): Promise<Application[]> {
    return this.repo.find({
      relations: ['job', 'candidate'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByJob(jobId: string): Promise<Application[]> {
    return this.repo.find({
      where: { jobId },
      relations: ['job', 'candidate'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCandidate(candidateId: string): Promise<Application[]> {
    return this.repo.find({
      where: { candidateId },
      relations: ['job', 'candidate'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }

  async save(application: Application): Promise<Application> {
    return this.repo.save(application);
  }
}
