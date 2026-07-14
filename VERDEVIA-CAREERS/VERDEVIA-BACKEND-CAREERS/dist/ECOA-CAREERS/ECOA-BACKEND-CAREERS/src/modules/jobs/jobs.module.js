"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const job_entity_1 = require("./entities/job.entity");
const typeorm_jobs_repository_1 = require("./infrastructure/persistence/typeorm-jobs.repository");
const create_job_usecase_1 = require("./use-cases/create-job.usecase");
const find_all_jobs_usecase_1 = require("./use-cases/find-all-jobs.usecase");
const find_one_job_usecase_1 = require("./use-cases/find-one-job.usecase");
const update_job_usecase_1 = require("./use-cases/update-job.usecase");
const delete_job_usecase_1 = require("./use-cases/delete-job.usecase");
const jobs_controller_1 = require("./controllers/jobs.controller");
const jobs_resolver_1 = require("./resolvers/jobs.resolver");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([job_entity_1.Job])],
        controllers: [jobs_controller_1.JobsController],
        providers: [
            create_job_usecase_1.CreateJobUseCase,
            find_all_jobs_usecase_1.FindAllJobsUseCase,
            find_one_job_usecase_1.FindOneJobUseCase,
            update_job_usecase_1.UpdateJobUseCase,
            delete_job_usecase_1.DeleteJobUseCase,
            jobs_resolver_1.JobsResolver,
            {
                provide: 'IJobsRepository',
                useClass: typeorm_jobs_repository_1.TypeORMJobsRepository,
            },
        ],
        exports: [
            create_job_usecase_1.CreateJobUseCase,
            find_all_jobs_usecase_1.FindAllJobsUseCase,
            find_one_job_usecase_1.FindOneJobUseCase,
            {
                provide: 'IJobsRepository',
                useClass: typeorm_jobs_repository_1.TypeORMJobsRepository,
            },
        ],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map