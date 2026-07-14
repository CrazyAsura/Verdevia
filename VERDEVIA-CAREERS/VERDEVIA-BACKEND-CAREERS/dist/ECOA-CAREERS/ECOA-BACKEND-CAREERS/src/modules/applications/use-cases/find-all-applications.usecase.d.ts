import { IApplicationsRepository } from '../domain/ports/applications.repository.interface';
import { Application } from '../entities/application.entity';
export declare class FindAllApplicationsUseCase {
    private readonly repository;
    constructor(repository: IApplicationsRepository);
    execute(): Promise<Application[]>;
}
