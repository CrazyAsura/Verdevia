import { Application } from '../../entities/application.entity';
export interface IApplicationsRepository {
    create(application: Partial<Application>): Promise<Application>;
    update(id: string, application: Partial<Application>): Promise<Application>;
    findById(id: string): Promise<Application | null>;
    findAll(): Promise<Application[]>;
    findByJob(jobId: string): Promise<Application[]>;
    findByCandidate(candidateId: string): Promise<Application[]>;
    delete(id: string): Promise<boolean>;
    save(application: Application): Promise<Application>;
}
