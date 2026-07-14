"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const applications_graphql_dto_1 = require("../dto/graphql/applications-graphql.dto");
const apply_for_job_usecase_1 = require("../use-cases/apply-for-job.usecase");
const find_all_applications_usecase_1 = require("../use-cases/find-all-applications.usecase");
const update_application_status_usecase_1 = require("../use-cases/update-application-status.usecase");
let ApplicationsResolver = class ApplicationsResolver {
    applyUseCase;
    findAllUseCase;
    updateStatusUseCase;
    constructor(applyUseCase, findAllUseCase, updateStatusUseCase) {
        this.applyUseCase = applyUseCase;
        this.findAllUseCase = findAllUseCase;
        this.updateStatusUseCase = updateStatusUseCase;
    }
    async applications() {
        const apps = await this.findAllUseCase.execute();
        return apps.map(app => this.mapApplication(app));
    }
    async applyForJob(input) {
        const app = await this.applyUseCase.execute(input);
        return this.mapApplication(app);
    }
    async updateApplicationStatus(id, input) {
        const app = await this.updateStatusUseCase.execute(id, input);
        return this.mapApplication(app);
    }
    mapApplication(app) {
        return {
            id: app.id,
            jobId: app.jobId,
            candidateId: app.candidateId,
            status: app.status,
            feedback: app.feedback || undefined,
            job: app.job ? {
                id: app.job.id,
                title: app.job.title,
                description: app.job.description,
                requirements: app.job.requirements || undefined,
                benefits: app.job.benefits || undefined,
                location: app.job.location || undefined,
                salary: app.job.salary ? Number(app.job.salary) : undefined,
                status: app.job.status,
                createdAt: app.job.createdAt,
                updatedAt: app.job.updatedAt,
            } : undefined,
            candidate: app.candidate ? {
                id: app.candidate.id,
                name: app.candidate.name,
                email: app.candidate.email,
                phone: app.candidate.phone || undefined,
                resumeUrl: app.candidate.resumeUrl || undefined,
                linkedInUrl: app.candidate.linkedInUrl || undefined,
                createdAt: app.candidate.createdAt,
                updatedAt: app.candidate.updatedAt,
            } : undefined,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
        };
    }
};
exports.ApplicationsResolver = ApplicationsResolver;
__decorate([
    (0, graphql_1.Query)(() => [applications_graphql_dto_1.ApplicationType], { description: 'List all applications' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplicationsResolver.prototype, "applications", null);
__decorate([
    (0, graphql_1.Mutation)(() => applications_graphql_dto_1.ApplicationType, { description: 'Apply for a job' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [applications_graphql_dto_1.ApplyForJobInput]),
    __metadata("design:returntype", Promise)
], ApplicationsResolver.prototype, "applyForJob", null);
__decorate([
    (0, graphql_1.Mutation)(() => applications_graphql_dto_1.ApplicationType, { description: 'Update application status' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, applications_graphql_dto_1.UpdateApplicationStatusInput]),
    __metadata("design:returntype", Promise)
], ApplicationsResolver.prototype, "updateApplicationStatus", null);
exports.ApplicationsResolver = ApplicationsResolver = __decorate([
    (0, graphql_1.Resolver)(() => applications_graphql_dto_1.ApplicationType),
    __metadata("design:paramtypes", [apply_for_job_usecase_1.ApplyForJobUseCase,
        find_all_applications_usecase_1.FindAllApplicationsUseCase,
        update_application_status_usecase_1.UpdateApplicationStatusUseCase])
], ApplicationsResolver);
//# sourceMappingURL=applications.resolver.js.map