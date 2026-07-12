import { Injectable } from '@nestjs/common';
import { UserRole } from '../../users/enums/user.enums';
import {
  PLAN_DEFINITIONS,
  PlanFeature,
  ROLE_DEFAULT_PLAN,
  SubscriptionPlan,
} from '../plans';
import { Subscription } from '../entities/subscription.entity';

/** Platform-privileged roles that bypass subscription checks entirely. */
const PRIVILEGED_ROLES = new Set<string>([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

@Injectable()
export class PlanPolicyService {
  getDefaultPlanForRole(role?: UserRole | string): SubscriptionPlan {
    return ROLE_DEFAULT_PLAN[role as UserRole] ?? 'free';
  }


  normalizePlan(plan?: string | null): SubscriptionPlan {
    if (plan === 'super-contractor') return 'super_contractor';
    if (plan && plan in PLAN_DEFINITIONS) return plan as SubscriptionPlan;
    return 'free';
  }

  isSubscriptionActive(subscription?: Partial<Subscription> | null): boolean {
    if (!subscription) return false;
    const plan = this.normalizePlan(subscription.plan);
    if (plan === 'free') return true;
    if (subscription.subscriptionStatus !== 'active') return false;
    if (!subscription.subscriptionExpiresAt) return true;

    return new Date(subscription.subscriptionExpiresAt).getTime() > Date.now();
  }

  hasFeature(
    subscription: Partial<Subscription> | undefined | null,
    feature: PlanFeature,
    role?: UserRole | string,
  ): boolean {
    if (role && PRIVILEGED_ROLES.has(role)) return true;

    const effectiveSubscription = this.getEffectiveSubscription(subscription, role);
    const plan = this.normalizePlan(effectiveSubscription.plan);
    const definition = PLAN_DEFINITIONS[plan];

    if (!this.isSubscriptionActive(effectiveSubscription)) {
      return false;
    }

    return definition.features.includes(feature);
  }

  hasAnyFeature(
    subscription: Partial<Subscription> | undefined | null,
    features: PlanFeature[],
    role?: UserRole | string,
  ): boolean {
    return features.some((feature) =>
      this.hasFeature(subscription, feature, role),
    );
  }

  canUsePlan(
    subscription: Partial<Subscription> | undefined | null,
    allowedPlans: SubscriptionPlan[],
    role?: UserRole | string,
  ): boolean {
    if (role && PRIVILEGED_ROLES.has(role)) return true;

    const effectiveSubscription = this.getEffectiveSubscription(subscription, role);
    const plan = this.normalizePlan(effectiveSubscription.plan);

    return (
      allowedPlans.includes(plan) &&
      this.isSubscriptionActive(effectiveSubscription)
    );
  }

  private getEffectiveSubscription(
    subscription: Partial<Subscription> | undefined | null,
    role?: UserRole | string,
  ): Partial<Subscription> {
    if (subscription) return subscription;

    const plan = this.getDefaultPlanForRole(role);
    return {
      plan,
      subscriptionStatus: PLAN_DEFINITIONS[plan].activeStatus,
      subscriptionExpiresAt: null,
    };
  }
}
