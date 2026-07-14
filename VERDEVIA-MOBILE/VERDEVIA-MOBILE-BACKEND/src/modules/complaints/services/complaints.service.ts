import { Injectable } from '@nestjs/common';
import { CreateComplaintDto } from '../dto/create-complaint.dto';
import { UpdateComplaintDto } from '../dto/update-complaint.dto';
import { FindAllComplaintsUseCase } from '../use-cases/find-all-complaints.usecase';
import { CreateComplaintUseCase } from '../use-cases/create-complaint.usecase';
import { FindOneComplaintUseCase } from '../use-cases/find-one-complaint.usecase';
import { UpdateComplaintUseCase } from '../use-cases/update-complaint.usecase';
import { RemoveComplaintUseCase } from '../use-cases/remove-complaint.usecase';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly findAllComplaintsUseCase: FindAllComplaintsUseCase,
    private readonly createComplaintUseCase: CreateComplaintUseCase,
    private readonly findOneComplaintUseCase: FindOneComplaintUseCase,
    private readonly updateComplaintUseCase: UpdateComplaintUseCase,
    private readonly removeComplaintUseCase: RemoveComplaintUseCase,
  ) {}

  async findAll(page = 1, limit = 10, search?: string, status?: string) {
    return this.findAllComplaintsUseCase.execute(page, limit, search, status);
  }

  async create(dto: CreateComplaintDto) {
    return this.createComplaintUseCase.execute(dto);
  }

  async findOne(id: string) {
    return this.findOneComplaintUseCase.execute(id);
  }

  async update(id: string, dto: UpdateComplaintDto) {
    return this.updateComplaintUseCase.execute(id, dto);
  }

  async remove(id: string) {
    return this.removeComplaintUseCase.execute(id);
  }
}
