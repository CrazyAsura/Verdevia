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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApplicationStatusInput = exports.ApplyForJobInput = exports.ApplicationType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const jobs_graphql_dto_1 = require("../../jobs/dto/graphql/jobs-graphql.dto");
const candidates_graphql_dto_1 = require("../../candidates/dto/graphql/candidates-graphql.dto");
let ApplicationType = class ApplicationType {
    id;
    jobId;
    candidateId;
    status;
    feedback;
    job;
    candidate;
    createdAt;
    updatedAt;
};
exports.ApplicationType = ApplicationType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ApplicationType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ApplicationType.prototype, "jobId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ApplicationType.prototype, "candidateId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ApplicationType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ApplicationType.prototype, "feedback", void 0);
__decorate([
    (0, graphql_1.Field)(() => jobs_graphql_dto_1.JobType, { nullable: true }),
    __metadata("design:type", typeof (_a = typeof jobs_graphql_dto_1.JobType !== "undefined" && jobs_graphql_dto_1.JobType) === "function" ? _a : Object)
], ApplicationType.prototype, "job", void 0);
__decorate([
    (0, graphql_1.Field)(() => candidates_graphql_dto_1.CandidateType, { nullable: true }),
    __metadata("design:type", typeof (_b = typeof candidates_graphql_dto_1.CandidateType !== "undefined" && candidates_graphql_dto_1.CandidateType) === "function" ? _b : Object)
], ApplicationType.prototype, "candidate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ApplicationType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ApplicationType.prototype, "updatedAt", void 0);
exports.ApplicationType = ApplicationType = __decorate([
    (0, graphql_1.ObjectType)()
], ApplicationType);
let ApplyForJobInput = class ApplyForJobInput {
    jobId;
    name;
    email;
    phone;
    resumeUrl;
    linkedInUrl;
};
exports.ApplyForJobInput = ApplyForJobInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApplyForJobInput.prototype, "jobId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApplyForJobInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApplyForJobInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApplyForJobInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApplyForJobInput.prototype, "resumeUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApplyForJobInput.prototype, "linkedInUrl", void 0);
exports.ApplyForJobInput = ApplyForJobInput = __decorate([
    (0, graphql_1.InputType)()
], ApplyForJobInput);
let UpdateApplicationStatusInput = class UpdateApplicationStatusInput {
    status;
    feedback;
};
exports.UpdateApplicationStatusInput = UpdateApplicationStatusInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateApplicationStatusInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateApplicationStatusInput.prototype, "feedback", void 0);
exports.UpdateApplicationStatusInput = UpdateApplicationStatusInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateApplicationStatusInput);
//# sourceMappingURL=applications-graphql.dto.js.map