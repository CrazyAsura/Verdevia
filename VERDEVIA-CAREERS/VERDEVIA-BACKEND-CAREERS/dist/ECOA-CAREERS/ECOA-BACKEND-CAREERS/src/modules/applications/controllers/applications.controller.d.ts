import { ApplyForJobUseCase } from '../use-cases/apply-for-job.usecase';
import { FindAllApplicationsUseCase } from '../use-cases/find-all-applications.usecase';
import { UpdateApplicationStatusUseCase } from '../use-cases/update-application-status.usecase';
import { ApplyForJobDto } from '../dto/apply-for-job.dto';
import { UpdateApplicationStatusDto } from '../dto/update-application-status.dto';
export declare class ApplicationsController {
    private readonly applyUseCase;
    private readonly findAllUseCase;
    private readonly updateStatusUseCase;
    constructor(applyUseCase: ApplyForJobUseCase, findAllUseCase: FindAllApplicationsUseCase, updateStatusUseCase: UpdateApplicationStatusUseCase);
    apply(dto: ApplyForJobDto): Promise<import("../entities/application.entity").Application>;
    findAll(): Promise<import("../entities/application.entity").Application[]>;
    updateStatus(id: string, dto: UpdateApplicationStatusDto): Promise<import("../entities/application.entity").Application>;
}
