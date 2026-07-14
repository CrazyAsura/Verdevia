import { IApplicationsRepository } from '../domain/ports/applications.repository.interface';
import { UpdateApplicationStatusDto } from '../dto/update-application-status.dto';
import { Application } from '../entities/application.entity';
export declare class UpdateApplicationStatusUseCase {
    private readonly repository;
    constructor(repository: IApplicationsRepository);
    execute(id: string, dto: UpdateApplicationStatusDto): Promise<Application>;
}
