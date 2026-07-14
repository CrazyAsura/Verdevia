import { Repository } from 'typeorm';
import { IApplicationsRepository } from '../../domain/ports/applications.repository.interface';
import { Application } from '../../entities/application.entity';
export declare class TypeORMApplicationsRepository implements IApplicationsRepository {
    private readonly repo;
    constructor(repo: Repository<Application>);
    create(application: Partial<Application>): Promise<Application>;
    update(id: string, application: Partial<Application>): Promise<Application>;
    findById(id: string): Promise<Application | null>;
    findAll(): Promise<Application[]>;
    findByJob(jobId: string): Promise<Application[]>;
    findByCandidate(candidateId: string): Promise<Application[]>;
    delete(id: string): Promise<boolean>;
    save(application: Application): Promise<Application>;
}
