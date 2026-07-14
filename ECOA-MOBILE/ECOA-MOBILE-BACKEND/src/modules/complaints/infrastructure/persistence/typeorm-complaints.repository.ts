import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IComplaintsRepository } from '../../domain/ports/complaints.repository.interface';
import { Complaint } from '../../entities/complaint.entity';

@Injectable()
export class TypeORMComplaintsRepository implements IComplaintsRepository {
  constructor(
    @InjectRepository(Complaint)
    private readonly repo: Repository<Complaint>,
  ) {}

  async findAll(page: number, limit: number, search?: string, status?: string) {
    const where: any = {};
    if (search) where.description = Like(`%${search}%`);
    if (status) where.status = status;

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['user'],
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });

    return { items, total, lastPage: Math.ceil(total / Number(limit)) };
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  async create(complaint: Partial<Complaint>) {
    const item = this.repo.create(complaint);
    return this.repo.save(item);
  }

  async update(id: string, complaint: Partial<Complaint>) {
    await this.repo.update(id, complaint);
    return this.findById(id);
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }
}
