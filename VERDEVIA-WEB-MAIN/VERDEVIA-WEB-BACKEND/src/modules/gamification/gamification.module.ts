import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { UserGamification } from './entities/user-gamification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, UserGamification])],
  exports: [TypeOrmModule],
})
export class GamificationModule {}
