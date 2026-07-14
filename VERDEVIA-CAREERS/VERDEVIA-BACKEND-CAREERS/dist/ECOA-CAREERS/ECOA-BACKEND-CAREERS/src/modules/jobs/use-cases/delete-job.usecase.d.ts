import { IJobsRepository } from '../domain/ports/jobs.repository.interface';
export declare class DeleteJobUseCase {
    private readonly repository;
    constructor(repository: IJobsRepository);
    execute(id: string): Promise<boolean>;
}
