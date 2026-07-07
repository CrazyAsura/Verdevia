import { Injectable, Inject } from '@nestjs/common';
import { CreateComplaintDto } from '../dto/create-complaint.dto';
import { IComplaintsRepository } from '../domain/ports/complaints.repository.interface';

@Injectable()
export class CreateComplaintUseCase {
  constructor(
    @Inject('IComplaintsRepository')
    private readonly repository: IComplaintsRepository,
  ) {}

  async execute(dto: CreateComplaintDto) {
    return this.repository.create({
      ...dto,
      createdAt: new Date(),
    });
  }
}
