import { UserRole } from '../users/enums/user.enums';

export type SubscriptionPlan =
  | 'free'
  | 'plus'
  | 'pro'
  | 'admin'
  | 'contractor'
  | 'super_contractor';

export type BillingCycle = 'monthly' | 'yearly' | 'none';
export type SubscriptionStatus = 'active' | 'past_due' | 'unpaid' | 'none';

export type PlanFeature =
  | 'ai:analyze-image'
  | 'ai:chat'
  | 'ai:classify'
  | 'complaints:create'
  | 'complaints:manage'
  | 'contractors:manage'
  | 'courses:manage'
  | 'courses:read'
  | 'forum:moderate'
  | 'stats:audit'
  | 'stats:export'
  | 'stats:map-isolated';

export type PlanDefinition = {
  plan: SubscriptionPlan;
  name: string;
  role?: UserRole;
  activeStatus: SubscriptionStatus;
  features: PlanFeature[];
};

const USER_FEATURES: PlanFeature[] = ['complaints:create'];
const PLUS_FEATURES: PlanFeature[] = [...USER_FEATURES, 'courses:read', 'ai:chat'];
const PRO_FEATURES: PlanFeature[] = [
  ...PLUS_FEATURES,
  'ai:analyze-image',
  'ai:classify',
];
const ADMIN_FEATURES: PlanFeature[] = [
  'complaints:manage',
  'courses:manage',
  'forum:moderate',
  'stats:audit',
  'stats:export',
];
const CONTRACTOR_FEATURES: PlanFeature[] = [
  'complaints:manage',
  'stats:map-isolated',
];
const SUPER_CONTRACTOR_FEATURES: PlanFeature[] = [
  ...CONTRACTOR_FEATURES,
  'contractors:manage',
  'stats:audit',
  'stats:export',
];

export const PLAN_DEFINITIONS: Record<SubscriptionPlan, PlanDefinition> = {
  free: {
    plan: 'free',
    name: 'Plano Gratuito',
    activeStatus: 'none',
    features: USER_FEATURES,
  },
  plus: {
    plan: 'plus',
    name: 'Plano Plus',
    activeStatus: 'active',
    features: PLUS_FEATURES,
  },
  pro: {
    plan: 'pro',
    name: 'Plano Pro',
    activeStatus: 'active',
    features: PRO_FEATURES,
  },
  admin: {
    plan: 'admin',
    name: 'Licenca Administrador',
    role: UserRole.ADMIN,
    activeStatus: 'active',
    features: ADMIN_FEATURES,
  },
  contractor: {
    plan: 'contractor',
    name: 'Licenca Prestador',
    role: UserRole.CONTRACTOR,
    activeStatus: 'active',
    features: CONTRACTOR_FEATURES,
  },
  super_contractor: {
    plan: 'super_contractor',
    name: 'Licenca Super Operacao',
    role: UserRole.SUPER_CONTRACTOR,
    activeStatus: 'active',
    features: SUPER_CONTRACTOR_FEATURES,
  },
};

export const ROLE_DEFAULT_PLAN: Partial<Record<UserRole, SubscriptionPlan>> = {
  [UserRole.USER]: 'free',
  [UserRole.ADMIN]: 'admin',
  [UserRole.SUPER_ADMIN]: 'admin',
  [UserRole.CONTRACTOR]: 'contractor',
  [UserRole.SUPER_CONTRACTOR]: 'super_contractor',
};

export function createSeedSubscription(
  plan: SubscriptionPlan,
  billingCycle: BillingCycle = 'none',
  durationDays?: number,
) {
  const definition = PLAN_DEFINITIONS[plan];
  return {
    plan,
    billingCycle,
    subscriptionStatus: definition.activeStatus,
    subscriptionExpiresAt: durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null,
  };
}
