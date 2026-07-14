"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidatesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const candidate_entity_1 = require("./entities/candidate.entity");
const typeorm_candidates_repository_1 = require("./infrastructure/persistence/typeorm-candidates.repository");
const create_candidate_usecase_1 = require("./use-cases/create-candidate.usecase");
const find_all_candidates_usecase_1 = require("./use-cases/find-all-candidates.usecase");
const find_one_candidate_usecase_1 = require("./use-cases/find-one-candidate.usecase");
const candidates_controller_1 = require("./controllers/candidates.controller");
const candidates_resolver_1 = require("./resolvers/candidates.resolver");
let CandidatesModule = class CandidatesModule {
};
exports.CandidatesModule = CandidatesModule;
exports.CandidatesModule = CandidatesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([candidate_entity_1.Candidate])],
        controllers: [candidates_controller_1.CandidatesController],
        providers: [
            create_candidate_usecase_1.CreateCandidateUseCase,
            find_all_candidates_usecase_1.FindAllCandidatesUseCase,
            find_one_candidate_usecase_1.FindOneCandidateUseCase,
            candidates_resolver_1.CandidatesResolver,
            {
                provide: 'ICandidatesRepository',
                useClass: typeorm_candidates_repository_1.TypeORMCandidatesRepository,
            },
        ],
        exports: [
            create_candidate_usecase_1.CreateCandidateUseCase,
            find_all_candidates_usecase_1.FindAllCandidatesUseCase,
            find_one_candidate_usecase_1.FindOneCandidateUseCase,
            {
                provide: 'ICandidatesRepository',
                useClass: typeorm_candidates_repository_1.TypeORMCandidatesRepository,
            },
        ],
    })
], CandidatesModule);
//# sourceMappingURL=candidates.module.js.map