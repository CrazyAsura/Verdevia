import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { SparkPrediction } from './entities/spark-prediction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, SparkPrediction])],
  exports: [TypeOrmModule],
})
export class StatsModule {}
