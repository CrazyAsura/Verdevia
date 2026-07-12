import { Injectable, Inject } from '@nestjs/common';
import { JwtPayload } from '../../../common/security/jwt.strategy';
import { IStatsRepository } from '../domain/ports/stats.repository.interface';

@Injectable()
export class GetAuditLogsUseCase {
  constructor(
    @Inject('IStatsRepository')
    private readonly repository: IStatsRepository,
  ) {}

  async execute(page = 1, limit = 50, type?: string, user?: JwtPayload) {
    const userRole = user?.roles?.[0] || user?.userName; // fallback safely
    const [logs, total] = await this.repository.findAllAuditLogs(
      page,
      limit,
      type,
      user?.sub,
      userRole,
    );
    return {
      logs,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
