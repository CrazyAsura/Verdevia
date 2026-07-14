import { JobType, CreateJobInput, UpdateJobInput } from '../dto/graphql/jobs-graphql.dto';
import { CreateJobUseCase } from '../use-cases/create-job.usecase';
import { FindAllJobsUseCase } from '../use-cases/find-all-jobs.usecase';
import { FindOneJobUseCase } from '../use-cases/find-one-job.usecase';
import { UpdateJobUseCase } from '../use-cases/update-job.usecase';
import { DeleteJobUseCase } from '../use-cases/delete-job.usecase';
export declare class JobsResolver {
    private readonly createUseCase;
    private readonly findAllUseCase;
    private readonly findOneUseCase;
    private readonly updateUseCase;
    private readonly deleteUseCase;
    constructor(createUseCase: CreateJobUseCase, findAllUseCase: FindAllJobsUseCase, findOneUseCase: FindOneJobUseCase, updateUseCase: UpdateJobUseCase, deleteUseCase: DeleteJobUseCase);
    jobs(): Promise<JobType[]>;
    job(id: string): Promise<JobType | null>;
    createJob(input: CreateJobInput): Promise<JobType>;
    updateJob(id: string, input: UpdateJobInput): Promise<JobType>;
    deleteJob(id: string): Promise<boolean>;
    private mapJob;
}
