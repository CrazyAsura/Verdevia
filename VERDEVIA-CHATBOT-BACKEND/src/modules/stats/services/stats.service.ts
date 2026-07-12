import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../../common/security/jwt.strategy';
import { LogVisitUseCase } from '../use-cases/log-visit.usecase';
import { GetAuditLogsUseCase } from '../use-cases/get-audit-logs.usecase';
import { GetStatsUseCase } from '../use-cases/get-stats.usecase';
import { GetMapDataUseCase } from '../use-cases/get-map-data.usecase';
import { GetSparkPredictionsUseCase } from '../use-cases/get-spark-predictions.usecase';

@Injectable()
export class StatsService {
  constructor(
    private readonly logVisitUseCase: LogVisitUseCase,
    private readonly getAuditLogsUseCase: GetAuditLogsUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
    private readonly getMapDataUseCase: GetMapDataUseCase,
    private readonly getSparkPredictionsUseCase: GetSparkPredictionsUseCase,
  ) {}

  async logVisit(visitData: {
    path: string;
    userAgent: string;
    ip: string;
    userId?: string;
    userName?: string;
    action?: string;
    details?: any;
  }) {
    return this.logVisitUseCase.execute(visitData);
  }

  async getAuditLogs(page = 1, limit = 50, type?: string, user?: JwtPayload) {
    return this.getAuditLogsUseCase.execute(page, limit, type, user);
  }

  async getStats() {
    return this.getStatsUseCase.execute();
  }

  async getMapData(contractorId?: string) {
    return this.getMapDataUseCase.execute(contractorId);
  }

  async getSparkPredictions() {
    return this.getSparkPredictionsUseCase.execute();
  }
}
