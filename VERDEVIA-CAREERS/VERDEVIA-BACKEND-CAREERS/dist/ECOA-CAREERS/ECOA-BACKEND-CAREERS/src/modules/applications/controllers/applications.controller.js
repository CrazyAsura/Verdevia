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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const apply_for_job_usecase_1 = require("../use-cases/apply-for-job.usecase");
const find_all_applications_usecase_1 = require("../use-cases/find-all-applications.usecase");
const update_application_status_usecase_1 = require("../use-cases/update-application-status.usecase");
const apply_for_job_dto_1 = require("../dto/apply-for-job.dto");
const update_application_status_dto_1 = require("../dto/update-application-status.dto");
let ApplicationsController = class ApplicationsController {
    applyUseCase;
    findAllUseCase;
    updateStatusUseCase;
    constructor(applyUseCase, findAllUseCase, updateStatusUseCase) {
        this.applyUseCase = applyUseCase;
        this.findAllUseCase = findAllUseCase;
        this.updateStatusUseCase = updateStatusUseCase;
    }
    apply(dto) {
        return this.applyUseCase.execute(dto);
    }
    findAll() {
        return this.findAllUseCase.execute();
    }
    updateStatus(id, dto) {
        return this.updateStatusUseCase.execute(id, dto);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar uma nova candidatura' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apply_for_job_dto_1.ApplyForJobDto]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as candidaturas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar status da candidatura' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_status_dto_1.UpdateApplicationStatusDto]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "updateStatus", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, swagger_1.ApiTags)('Applications'),
    (0, common_1.Controller)('applications'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [apply_for_job_usecase_1.ApplyForJobUseCase,
        find_all_applications_usecase_1.FindAllApplicationsUseCase,
        update_application_status_usecase_1.UpdateApplicationStatusUseCase])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map