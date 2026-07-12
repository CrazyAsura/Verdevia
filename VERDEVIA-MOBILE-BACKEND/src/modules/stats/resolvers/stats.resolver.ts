import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import { StatsService } from '../services/stats.service';
import {
  AuditLogsType,
  DashboardStatsType,
  ExportFileType,
  ExportRequestType,
  LogVisitInput,
  MapDataPointType,
  SparkPredictionType,
} from '../dto/graphql/stats-graphql.dto';
import {
  CurrentUser,
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../../../common/security/jwt-auth.guard';
import { PlanAccessGuard } from '../../subscriptions/guards/plan-access.guard';
import { RequirePlanFeatures } from '../../subscriptions/decorators/require-plan.decorator';
import { JwtPayload } from '../../../common/security/jwt.strategy';

@Resolver()
export class StatsResolver {
  constructor(
    private readonly statsService: StatsService,
    @InjectQueue('export-queue')
    private readonly exportQueue: Queue,
  ) {}

  @Query(() => DashboardStatsType)
  async statsSummary(): Promise<DashboardStatsType> {
    return this.statsService.getStats();
  }

  @Query(() => AuditLogsType)
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('stats:audit')
  async auditLogs(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit: number,
    @Args('type', { nullable: true }) type?: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<AuditLogsType> {
    return this.statsService.getAuditLogs(page, limit, type, user);
  }

  @Query(() => [MapDataPointType])
  @UseGuards(OptionalJwtAuthGuard)
  async mapData(@CurrentUser() user?: any): Promise<MapDataPointType[]> {
    const isContractor =
      user && (user.role === 'contractor' || user.role === 'super_contractor');
    return this.statsService.getMapData(isContractor ? user.id : undefined);
  }

  @Query(() => [SparkPredictionType])
  async sparkPredictions(): Promise<SparkPredictionType[]> {
    return this.statsService.getSparkPredictions();
  }

  @Mutation(() => ExportRequestType)
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('stats:export')
  async requestExcelExport(@CurrentUser() user: any): Promise<ExportRequestType> {
    await this.exportQueue.add('generate-excel', {
      userId: user.id,
      role: user.role,
      email: user.email,
      format: 'excel',
    });

    return {
      queued: true,
      message:
        'Exportação iniciada em segundo plano. Você será notificado por WebSocket quando o download estiver pronto.',
    };
  }

  @Query(() => ExportFileType)
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('stats:export')
  async exportFile(
    @Args('filename') filename: string,
  ): Promise<ExportFileType> {
    const safeFilename = path.basename(filename);
    const filepath = path.join(process.cwd(), 'public', 'exports', safeFilename);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Arquivo não encontrado ou expirado.');
    }

    return {
      filename: safeFilename,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      base64: fs.readFileSync(filepath).toString('base64'),
    };
  }

  @Mutation(() => Boolean)
  async logVisit(
    @Args('input') input: LogVisitInput,
    @Context() context: any,
  ): Promise<boolean> {
    const req = context.req;
    await this.statsService.logVisit({
      ...input,
      ip:
        req?.ip ||
        req?.headers?.['x-forwarded-for'] ||
        req?.socket?.remoteAddress ||
        '0.0.0.0',
      userAgent: input.userAgent || req?.headers?.['user-agent'] || '',
    });
    return true;
  }
}
