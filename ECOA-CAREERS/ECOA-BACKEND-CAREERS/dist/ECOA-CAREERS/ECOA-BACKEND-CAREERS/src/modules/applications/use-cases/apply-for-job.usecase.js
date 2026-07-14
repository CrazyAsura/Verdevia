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
exports.ApplyForJobUseCase = void 0;
const common_1 = require("@nestjs/common");
const create_candidate_usecase_1 = require("../../candidates/use-cases/create-candidate.usecase");
const find_one_job_usecase_1 = require("../../jobs/use-cases/find-one-job.usecase");
let ApplyForJobUseCase = class ApplyForJobUseCase {
    repository;
    createCandidateUseCase;
    findOneJobUseCase;
    constructor(repository, createCandidateUseCase, findOneJobUseCase) {
        this.repository = repository;
        this.createCandidateUseCase = createCandidateUseCase;
        this.findOneJobUseCase = findOneJobUseCase;
    }
    async execute(dto) {
        const job = await this.findOneJobUseCase.execute(dto.jobId);
        if (!job) {
            throw new common_1.BadRequestException('Vaga inexistente');
        }
        const candidate = await this.createCandidateUseCase.execute({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            resumeUrl: dto.resumeUrl,
            linkedInUrl: dto.linkedInUrl,
        });
        const existingApps = await this.repository.findByCandidate(candidate.id);
        const alreadyApplied = existingApps.some(app => app.jobId === job.id);
        if (alreadyApplied) {
            throw new common_1.BadRequestException('Você já se candidatou para esta vaga');
        }
        return this.repository.create({
            jobId: job.id,
            candidateId: candidate.id,
            status: 'applied',
        });
    }
};
exports.ApplyForJobUseCase = ApplyForJobUseCase;
exports.ApplyForJobUseCase = ApplyForJobUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IApplicationsRepository')),
    __metadata("design:paramtypes", [Object, create_candidate_usecase_1.CreateCandidateUseCase,
        find_one_job_usecase_1.FindOneJobUseCase])
], ApplyForJobUseCase);
//# sourceMappingURL=apply-for-job.usecase.js.map