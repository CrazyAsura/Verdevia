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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeORMApplicationsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const application_entity_1 = require("../../entities/application.entity");
let TypeORMApplicationsRepository = class TypeORMApplicationsRepository {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(application) {
        const newApp = this.repo.create(application);
        const saved = await this.repo.save(newApp);
        return this.findById(saved.id);
    }
    async update(id, application) {
        await this.repo.update(id, application);
        return this.findById(id);
    }
    async findById(id) {
        return this.repo.findOne({
            where: { id },
            relations: ['job', 'candidate'],
        });
    }
    async findAll() {
        return this.repo.find({
            relations: ['job', 'candidate'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByJob(jobId) {
        return this.repo.find({
            where: { jobId },
            relations: ['job', 'candidate'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByCandidate(candidateId) {
        return this.repo.find({
            where: { candidateId },
            relations: ['job', 'candidate'],
            order: { createdAt: 'DESC' },
        });
    }
    async delete(id) {
        const result = await this.repo.delete(id);
        return result.affected > 0;
    }
    async save(application) {
        return this.repo.save(application);
    }
};
exports.TypeORMApplicationsRepository = TypeORMApplicationsRepository;
exports.TypeORMApplicationsRepository = TypeORMApplicationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TypeORMApplicationsRepository);
//# sourceMappingURL=typeorm-applications.repository.js.map