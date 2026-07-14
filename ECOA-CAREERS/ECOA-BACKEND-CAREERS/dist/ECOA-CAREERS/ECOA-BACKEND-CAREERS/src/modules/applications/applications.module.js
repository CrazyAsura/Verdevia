"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const application_entity_1 = require("./entities/application.entity");
const typeorm_applications_repository_1 = require("./infrastructure/persistence/typeorm-applications.repository");
const apply_for_job_usecase_1 = require("./use-cases/apply-for-job.usecase");
const find_all_applications_usecase_1 = require("./use-cases/find-all-applications.usecase");
const update_application_status_usecase_1 = require("./use-cases/update-application-status.usecase");
const applications_controller_1 = require("./controllers/applications.controller");
const applications_resolver_1 = require("./resolvers/applications.resolver");
const jobs_module_1 = require("../jobs/jobs.module");
const candidates_module_1 = require("../candidates/candidates.module");
let ApplicationsModule = class ApplicationsModule {
};
exports.ApplicationsModule = ApplicationsModule;
exports.ApplicationsModule = ApplicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([application_entity_1.Application]),
            jobs_module_1.JobsModule,
            candidates_module_1.CandidatesModule,
        ],
        controllers: [applications_controller_1.ApplicationsController],
        providers: [
            apply_for_job_usecase_1.ApplyForJobUseCase,
            find_all_applications_usecase_1.FindAllApplicationsUseCase,
            update_application_status_usecase_1.UpdateApplicationStatusUseCase,
            applications_resolver_1.ApplicationsResolver,
            {
                provide: 'IApplicationsRepository',
                useClass: typeorm_applications_repository_1.TypeORMApplicationsRepository,
            },
        ],
        exports: [
            apply_for_job_usecase_1.ApplyForJobUseCase,
            find_all_applications_usecase_1.FindAllApplicationsUseCase,
            update_application_status_usecase_1.UpdateApplicationStatusUseCase,
            {
                provide: 'IApplicationsRepository',
                useClass: typeorm_applications_repository_1.TypeORMApplicationsRepository,
            },
        ],
    })
], ApplicationsModule);
//# sourceMappingURL=applications.module.js.map