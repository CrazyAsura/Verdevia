import { Injectable, Inject } from '@nestjs/common';
import { UpdateComplaintDto } from '../dto/update-complaint.dto';
import { IComplaintsRepository } from '../domain/ports/complaints.repository.interface';

@Injectable()
export class UpdateComplaintUseCase {
  constructor(
    @Inject('IComplaintsRepository')
    private readonly repository: IComplaintsRepository,
  ) {}

  async execute(id: string, dto: UpdateComplaintDto) {
    return this.repository.update(id, dto);
  }
}
