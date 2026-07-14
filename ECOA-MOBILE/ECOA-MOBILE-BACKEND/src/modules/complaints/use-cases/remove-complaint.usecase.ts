import { Injectable, Inject } from '@nestjs/common';
import { IComplaintsRepository } from '../domain/ports/complaints.repository.interface';

@Injectable()
export class RemoveComplaintUseCase {
  constructor(
    @Inject('IComplaintsRepository')
    private readonly repository: IComplaintsRepository,
  ) {}

  async execute(id: string) {
    const success = await this.repository.delete(id);
    return { success };
  }
}
