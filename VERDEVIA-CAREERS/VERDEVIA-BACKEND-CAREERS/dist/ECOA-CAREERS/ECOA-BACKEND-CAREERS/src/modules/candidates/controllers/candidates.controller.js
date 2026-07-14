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
exports.CandidatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_candidate_usecase_1 = require("../use-cases/create-candidate.usecase");
const find_all_candidates_usecase_1 = require("../use-cases/find-all-candidates.usecase");
const find_one_candidate_usecase_1 = require("../use-cases/find-one-candidate.usecase");
const create_candidate_dto_1 = require("../dto/create-candidate.dto");
let CandidatesController = class CandidatesController {
    createUseCase;
    findAllUseCase;
    findOneUseCase;
    constructor(createUseCase, findAllUseCase, findOneUseCase) {
        this.createUseCase = createUseCase;
        this.findAllUseCase = findAllUseCase;
        this.findOneUseCase = findOneUseCase;
    }
    create(dto) {
        return this.createUseCase.execute(dto);
    }
    findAll() {
        return this.findAllUseCase.execute();
    }
    findOne(id) {
        return this.findOneUseCase.execute(id);
    }
};
exports.CandidatesController = CandidatesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar um candidato' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_candidate_dto_1.CreateCandidateDto]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os candidatos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes do candidato por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "findOne", null);
exports.CandidatesController = CandidatesController = __decorate([
    (0, swagger_1.ApiTags)('Candidates'),
    (0, common_1.Controller)('candidates'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [create_candidate_usecase_1.CreateCandidateUseCase,
        find_all_candidates_usecase_1.FindAllCandidatesUseCase,
        find_one_candidate_usecase_1.FindOneCandidateUseCase])
], CandidatesController);
//# sourceMappingURL=candidates.controller.js.map