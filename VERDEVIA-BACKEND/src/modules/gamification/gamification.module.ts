import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGamification } from './entities/user-gamification.entity';
import { Achievement } from './entities/achievement.entity';
import { RewardPassLevel } from './entities/reward-pass.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserGamification, Achievement, RewardPassLevel]),
  ],
  exports: [TypeOrmModule],
})
export class GamificationModule {}
