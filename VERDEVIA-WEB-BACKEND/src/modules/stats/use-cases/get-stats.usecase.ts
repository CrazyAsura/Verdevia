import { Injectable, Inject } from '@nestjs/common';
import { IStatsRepository } from '../domain/ports/stats.repository.interface';

@Injectable()
export class GetStatsUseCase {
  constructor(
    @Inject('IStatsRepository')
    private readonly repository: IStatsRepository,
  ) {}

  async execute() {
    const [totalUsers, totalComplaints, recentComplaints] = await Promise.all([
      this.repository.countUsers(),
      this.repository.countComplaints(),
      this.repository.getRecentComplaints(5),
    ]);

    return {
      totalUsers,
      totalComplaints,
      recentComplaints,
    };
  }
}
