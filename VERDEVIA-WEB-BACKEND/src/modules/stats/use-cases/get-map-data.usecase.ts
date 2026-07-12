import { Injectable, Inject } from '@nestjs/common';
import { IStatsRepository } from '../domain/ports/stats.repository.interface';

@Injectable()
export class GetMapDataUseCase {
  constructor(
    @Inject('IStatsRepository')
    private readonly repository: IStatsRepository,
  ) {}

  async execute(contractorId?: string) {
    return this.repository.getComplaintsLocations(contractorId);
  }
}
