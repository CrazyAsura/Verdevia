import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { PlanAccessGuard } from './guards/plan-access.guard';
import { PlanPolicyService } from './services/plan-policy.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  providers: [PlanPolicyService, PlanAccessGuard],
  exports: [TypeOrmModule, PlanPolicyService, PlanAccessGuard],
})
export class SubscriptionsModule {}
