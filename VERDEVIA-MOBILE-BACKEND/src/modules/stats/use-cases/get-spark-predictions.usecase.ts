import { Injectable, Inject } from '@nestjs/common';
import { IStatsRepository } from '../domain/ports/stats.repository.interface';

@Injectable()
export class GetSparkPredictionsUseCase {
  constructor(
    @Inject('IStatsRepository')
    private readonly repository: IStatsRepository,
  ) {}

  async execute() {
    return this.repository.getSparkPredictions();
  }
}
