import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IComplaintsRepository } from '../domain/ports/complaints.repository.interface';

@Injectable()
export class FindOneComplaintUseCase {
  constructor(
    @Inject('IComplaintsRepository')
    private readonly repository: IComplaintsRepository,
  ) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('Queixa não encontrada');
    return item;
  }
}
