import { SetMetadata } from '@nestjs/common';
import { PlanFeature, SubscriptionPlan } from '../plans';

export const REQUIRED_PLANS_KEY = 'requiredPlans';
export const REQUIRED_PLAN_FEATURES_KEY = 'requiredPlanFeatures';

export const RequirePlans = (...plans: SubscriptionPlan[]) =>
  SetMetadata(REQUIRED_PLANS_KEY, plans);

export const RequirePlanFeatures = (...features: PlanFeature[]) =>
  SetMetadata(REQUIRED_PLAN_FEATURES_KEY, features);
