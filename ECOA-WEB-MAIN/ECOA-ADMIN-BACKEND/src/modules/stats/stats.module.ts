import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { StatsController } from './controllers/stats.controller';
import { StatsService } from './services/stats.service';
import { TypeORMStatsRepository } from './infrastructure/persistence/typeorm-stats.repository';
import { AuditLog } from './entities/audit-log.entity';
import { LogVisitUseCase } from './use-cases/log-visit.usecase';
import { BullModule } from '@nestjs/bullmq';
import { SparkPrediction } from './entities/spark-prediction.entity';
import { GetAuditLogsUseCase } from './use-cases/get-audit-logs.usecase';
import { GetStatsUseCase } from './use-cases/get-stats.usecase';
import { GetMapDataUseCase } from './use-cases/get-map-data.usecase';
import { GetSparkPredictionsUseCase } from './use-cases/get-spark-predictions.usecase';
import { NotificationsModule } from '../notifications/notifications.module';
import { ExportProcessor } from './use-cases/export.processor';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { StatsResolver } from './resolvers/stats.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Complaint, AuditLog, SparkPrediction]),
    BullModule.registerQueue({
      name: 'export-queue',
    }),
    NotificationsModule,
    SubscriptionsModule,
  ],
  controllers: [StatsController],
  providers: [
    StatsResolver,
    ExportProcessor,
    StatsService,
    {
      provide: 'IStatsRepository',
      useClass: TypeORMStatsRepository,
    },
    LogVisitUseCase,
    GetAuditLogsUseCase,
    GetStatsUseCase,
    GetMapDataUseCase,
    GetSparkPredictionsUseCase,
  ],
  exports: [StatsService, BullModule],
})
export class StatsModule {}
