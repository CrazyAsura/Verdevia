import { CreateJobUseCase } from '../use-cases/create-job.usecase';
import { FindAllJobsUseCase } from '../use-cases/find-all-jobs.usecase';
import { FindOneJobUseCase } from '../use-cases/find-one-job.usecase';
import { UpdateJobUseCase } from '../use-cases/update-job.usecase';
import { DeleteJobUseCase } from '../use-cases/delete-job.usecase';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
export declare class JobsController {
    private readonly createUseCase;
    private readonly findAllUseCase;
    private readonly findOneUseCase;
    private readonly updateUseCase;
    private readonly deleteUseCase;
    constructor(createUseCase: CreateJobUseCase, findAllUseCase: FindAllJobsUseCase, findOneUseCase: FindOneJobUseCase, updateUseCase: UpdateJobUseCase, deleteUseCase: DeleteJobUseCase);
    create(dto: CreateJobDto): Promise<import("../entities/job.entity").Job>;
    findAll(): Promise<import("../entities/job.entity").Job[]>;
    findOne(id: string): Promise<import("../entities/job.entity").Job>;
    update(id: string, dto: UpdateJobDto): Promise<import("../entities/job.entity").Job>;
    remove(id: string): Promise<boolean>;
}
