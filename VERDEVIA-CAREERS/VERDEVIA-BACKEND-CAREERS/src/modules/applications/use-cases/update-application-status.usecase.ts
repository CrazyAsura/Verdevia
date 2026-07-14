import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IApplicationsRepository } from '../domain/ports/applications.repository.interface';
import { UpdateApplicationStatusDto } from '../dto/update-application-status.dto';
import { Application } from '../entities/application.entity';

@Injectable()
export class UpdateApplicationStatusUseCase {
  constructor(
    @Inject('IApplicationsRepository')
    private readonly repository: IApplicationsRepository,
  ) {}

  async execute(id: string, dto: UpdateApplicationStatusDto): Promise<Application> {
    const application = await this.repository.findById(id);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return this.repository.update(id, dto);
  }
}
