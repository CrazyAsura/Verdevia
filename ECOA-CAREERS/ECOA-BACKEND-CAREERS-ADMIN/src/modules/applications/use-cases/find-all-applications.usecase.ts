import { Injectable, Inject } from '@nestjs/common';
import { IApplicationsRepository } from '../domain/ports/applications.repository.interface';
import { Application } from '../entities/application.entity';

@Injectable()
export class FindAllApplicationsUseCase {
  constructor(
    @Inject('IApplicationsRepository')
    private readonly repository: IApplicationsRepository,
  ) {}

  async execute(): Promise<Application[]> {
    return this.repository.findAll();
  }
}
