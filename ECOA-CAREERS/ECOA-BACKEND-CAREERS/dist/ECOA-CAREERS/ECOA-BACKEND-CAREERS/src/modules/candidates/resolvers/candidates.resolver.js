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
exports.CandidatesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const candidates_graphql_dto_1 = require("../dto/graphql/candidates-graphql.dto");
const create_candidate_usecase_1 = require("../use-cases/create-candidate.usecase");
const find_all_candidates_usecase_1 = require("../use-cases/find-all-candidates.usecase");
const find_one_candidate_usecase_1 = require("../use-cases/find-one-candidate.usecase");
let CandidatesResolver = class CandidatesResolver {
    createUseCase;
    findAllUseCase;
    findOneUseCase;
    constructor(createUseCase, findAllUseCase, findOneUseCase) {
        this.createUseCase = createUseCase;
        this.findAllUseCase = findAllUseCase;
        this.findOneUseCase = findOneUseCase;
    }
    async candidates() {
        const candidates = await this.findAllUseCase.execute();
        return candidates.map(c => this.mapCandidate(c));
    }
    async candidate(id) {
        try {
            const candidate = await this.findOneUseCase.execute(id);
            return this.mapCandidate(candidate);
        }
        catch {
            return null;
        }
    }
    async createCandidate(input) {
        const candidate = await this.createUseCase.execute(input);
        return this.mapCandidate(candidate);
    }
    mapCandidate(candidate) {
        return {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone || undefined,
            resumeUrl: candidate.resumeUrl || undefined,
            linkedInUrl: candidate.linkedInUrl || undefined,
            createdAt: candidate.createdAt,
            updatedAt: candidate.updatedAt,
        };
    }
};
exports.CandidatesResolver = CandidatesResolver;
__decorate([
    (0, graphql_1.Query)(() => [candidates_graphql_dto_1.CandidateType], { description: 'List all candidates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CandidatesResolver.prototype, "candidates", null);
__decorate([
    (0, graphql_1.Query)(() => candidates_graphql_dto_1.CandidateType, { nullable: true, description: 'Get candidate by ID' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CandidatesResolver.prototype, "candidate", null);
__decorate([
    (0, graphql_1.Mutation)(() => candidates_graphql_dto_1.CandidateType, { description: 'Create or update candidate' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [candidates_graphql_dto_1.CreateCandidateInput]),
    __metadata("design:returntype", Promise)
], CandidatesResolver.prototype, "createCandidate", null);
exports.CandidatesResolver = CandidatesResolver = __decorate([
    (0, graphql_1.Resolver)(() => candidates_graphql_dto_1.CandidateType),
    __metadata("design:paramtypes", [create_candidate_usecase_1.CreateCandidateUseCase,
        find_all_candidates_usecase_1.FindAllCandidatesUseCase,
        find_one_candidate_usecase_1.FindOneCandidateUseCase])
], CandidatesResolver);
//# sourceMappingURL=candidates.resolver.js.map