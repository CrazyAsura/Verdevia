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
exports.JobsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const jobs_graphql_dto_1 = require("../dto/graphql/jobs-graphql.dto");
const create_job_usecase_1 = require("../use-cases/create-job.usecase");
const find_all_jobs_usecase_1 = require("../use-cases/find-all-jobs.usecase");
const find_one_job_usecase_1 = require("../use-cases/find-one-job.usecase");
const update_job_usecase_1 = require("../use-cases/update-job.usecase");
const delete_job_usecase_1 = require("../use-cases/delete-job.usecase");
let JobsResolver = class JobsResolver {
    createUseCase;
    findAllUseCase;
    findOneUseCase;
    updateUseCase;
    deleteUseCase;
    constructor(createUseCase, findAllUseCase, findOneUseCase, updateUseCase, deleteUseCase) {
        this.createUseCase = createUseCase;
        this.findAllUseCase = findAllUseCase;
        this.findOneUseCase = findOneUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
    }
    async jobs() {
        const jobs = await this.findAllUseCase.execute();
        return jobs.map(job => this.mapJob(job));
    }
    async job(id) {
        try {
            const job = await this.findOneUseCase.execute(id);
            return this.mapJob(job);
        }
        catch {
            return null;
        }
    }
    async createJob(input) {
        const job = await this.createUseCase.execute(input);
        return this.mapJob(job);
    }
    async updateJob(id, input) {
        const job = await this.updateUseCase.execute(id, input);
        return this.mapJob(job);
    }
    async deleteJob(id) {
        return this.deleteUseCase.execute(id);
    }
    mapJob(job) {
        return {
            id: job.id,
            title: job.title,
            description: job.description,
            requirements: job.requirements || undefined,
            benefits: job.benefits || undefined,
            location: job.location || undefined,
            salary: job.salary ? Number(job.salary) : undefined,
            status: job.status,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }
};
exports.JobsResolver = JobsResolver;
__decorate([
    (0, graphql_1.Query)(() => [jobs_graphql_dto_1.JobType], { description: 'List all jobs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsResolver.prototype, "jobs", null);
__decorate([
    (0, graphql_1.Query)(() => jobs_graphql_dto_1.JobType, { nullable: true, description: 'Get job by ID' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsResolver.prototype, "job", null);
__decorate([
    (0, graphql_1.Mutation)(() => jobs_graphql_dto_1.JobType, { description: 'Create a new job' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jobs_graphql_dto_1.CreateJobInput]),
    __metadata("design:returntype", Promise)
], JobsResolver.prototype, "createJob", null);
__decorate([
    (0, graphql_1.Mutation)(() => jobs_graphql_dto_1.JobType, { description: 'Update a job' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, jobs_graphql_dto_1.UpdateJobInput]),
    __metadata("design:returntype", Promise)
], JobsResolver.prototype, "updateJob", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Delete a job' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsResolver.prototype, "deleteJob", null);
exports.JobsResolver = JobsResolver = __decorate([
    (0, graphql_1.Resolver)(() => jobs_graphql_dto_1.JobType),
    __metadata("design:paramtypes", [create_job_usecase_1.CreateJobUseCase,
        find_all_jobs_usecase_1.FindAllJobsUseCase,
        find_one_job_usecase_1.FindOneJobUseCase,
        update_job_usecase_1.UpdateJobUseCase,
        delete_job_usecase_1.DeleteJobUseCase])
], JobsResolver);
//# sourceMappingURL=jobs.resolver.js.map