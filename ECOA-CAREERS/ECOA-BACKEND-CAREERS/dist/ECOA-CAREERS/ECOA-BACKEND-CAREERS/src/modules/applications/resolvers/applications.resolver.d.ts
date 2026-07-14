import { ApplicationType, ApplyForJobInput, UpdateApplicationStatusInput } from '../dto/graphql/applications-graphql.dto';
import { ApplyForJobUseCase } from '../use-cases/apply-for-job.usecase';
import { FindAllApplicationsUseCase } from '../use-cases/find-all-applications.usecase';
import { UpdateApplicationStatusUseCase } from '../use-cases/update-application-status.usecase';
export declare class ApplicationsResolver {
    private readonly applyUseCase;
    private readonly findAllUseCase;
    private readonly updateStatusUseCase;
    constructor(applyUseCase: ApplyForJobUseCase, findAllUseCase: FindAllApplicationsUseCase, updateStatusUseCase: UpdateApplicationStatusUseCase);
    applications(): Promise<ApplicationType[]>;
    applyForJob(input: ApplyForJobInput): Promise<ApplicationType>;
    updateApplicationStatus(id: string, input: UpdateApplicationStatusInput): Promise<ApplicationType>;
    private mapApplication;
}
