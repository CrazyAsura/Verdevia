import { Injectable, Inject } from '@nestjs/common';
import { IStatsRepository } from '../domain/ports/stats.repository.interface';

@Injectable()
export class LogVisitUseCase {
  constructor(
    @Inject('IStatsRepository')
    private readonly repository: IStatsRepository,
  ) {}

  async execute(visitData: {
    path: string;
    userAgent: string;
    ip: string;
    userId?: string;
    userName?: string;
    action?: string;
    details?: any;
  }) {
    await this.repository.createAuditLog({
      action: visitData.action || 'PAGE_ACCESS',
      route: visitData.path,
      ip: visitData.ip,
      userAgent: visitData.userAgent,
      userId: visitData.userId,
      userName: visitData.userName,
      details: visitData.details,
    });
    return { success: true };
  }
}
