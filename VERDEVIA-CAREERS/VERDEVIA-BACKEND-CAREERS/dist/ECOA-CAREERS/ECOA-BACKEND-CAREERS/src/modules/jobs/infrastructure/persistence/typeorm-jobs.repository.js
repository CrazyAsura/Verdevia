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
exports.TypeORMJobsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("../../entities/job.entity");
let TypeORMJobsRepository = class TypeORMJobsRepository {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(job) {
        const newJob = this.repo.create(job);
        return this.repo.save(newJob);
    }
    async update(id, job) {
        await this.repo.update(id, job);
        return this.findById(id);
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async findAll() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    async delete(id) {
        const result = await this.repo.delete(id);
        return result.affected > 0;
    }
    async save(job) {
        return this.repo.save(job);
    }
};
exports.TypeORMJobsRepository = TypeORMJobsRepository;
exports.TypeORMJobsRepository = TypeORMJobsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TypeORMJobsRepository);
//# sourceMappingURL=typeorm-jobs.repository.js.map