import { Injectable, Inject } from '@nestjs/common';
import { IComplaintsRepository } from '../domain/ports/complaints.repository.interface';

@Injectable()
export class FindAllComplaintsUseCase {
  constructor(
    @Inject('IComplaintsRepository')
    private readonly repository: IComplaintsRepository,
  ) {}

  async execute(page = 1, limit = 10, search?: string, status?: string) {
    const result = await this.repository.findAll(page, limit, search, status);
    return { ...result, page };
  }
}
