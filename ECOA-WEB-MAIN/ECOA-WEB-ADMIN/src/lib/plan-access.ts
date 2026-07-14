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

export type SubscriptionPlan =
  | 'free'
  | 'plus'
  | 'pro'
  | 'admin'
  | 'contractor'
  | 'super_contractor';

export type PlanAwareUser = {
  role?: string;
  plan?: string;
  subscriptionStatus?: string;
};

const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeature[]> = {
  free: ['complaints:create'],
  plus: ['complaints:create', 'courses:read', 'ai:chat'],
  pro: ['complaints:create', 'courses:read', 'ai:chat', 'ai:analyze-image', 'ai:classify'],
  admin: ['complaints:manage', 'courses:manage', 'forum:moderate', 'stats:audit', 'stats:export'],
  contractor: ['complaints:manage', 'stats:map-isolated'],
  super_contractor: ['complaints:manage', 'stats:map-isolated', 'contractors:manage', 'stats:audit', 'stats:export'],
};

const ROLE_DEFAULT_PLAN: Record<string, SubscriptionPlan> = {
  admin: 'admin',
  super_admin: 'admin',
  'super-admin': 'admin',
  contractor: 'contractor',
  super_contractor: 'super_contractor',
  'super-contractor': 'super_contractor',
};

export function normalizePlan(plan?: string | null): SubscriptionPlan {
  if (plan === 'super-contractor') return 'super_contractor';
  if (plan && plan in PLAN_FEATURES) return plan as SubscriptionPlan;
  return 'free';
}

export function getEffectivePlan(user?: PlanAwareUser | null): SubscriptionPlan {
  return normalizePlan(user?.plan ?? ROLE_DEFAULT_PLAN[user?.role?.toLowerCase() ?? '']);
}

export function isPlanActive(user?: PlanAwareUser | null): boolean {
  const plan = getEffectivePlan(user);
  if (plan === 'free') return true;
  return (user?.subscriptionStatus ?? 'active') === 'active';
}

export function hasPlanFeature(user: PlanAwareUser | null | undefined, feature: PlanFeature): boolean {
  const plan = getEffectivePlan(user);
  return isPlanActive(user) && PLAN_FEATURES[plan].includes(feature);
}

export function hasAnyPlanFeature(user: PlanAwareUser | null | undefined, features: PlanFeature[]): boolean {
  return features.some((feature) => hasPlanFeature(user, feature));
}

export const FEATURE_MARKETING_COPY: Partial<Record<PlanFeature, { title: string; text: string; cta: string }>> = {
  'ai:chat': {
    title: 'IA consultiva bloqueada',
    text: 'Este recurso acelera a triagem e exige um plano com automacao inteligente.',
    cta: 'Investir em um plano melhor',
  },
  'ai:analyze-image': {
    title: 'Analise avancada bloqueada',
    text: 'A verificacao de autenticidade por IA fica disponivel nos planos superiores.',
    cta: 'Liberar IA avancada',
  },
  'courses:manage': {
    title: 'Academia ECOA bloqueada',
    text: 'Gestao de cursos e conteudo educacional faz parte da licenca administrativa.',
    cta: 'Ativar licenca administrativa',
  },
  'complaints:manage': {
    title: 'Central operacional bloqueada',
    text: 'A triagem e gestao de denuncias exigem uma licenca operacional ativa.',
    cta: 'Ativar operacao',
  },
  'stats:audit': {
    title: 'Auditoria premium bloqueada',
    text: 'Logs e rastreabilidade completa sao recursos de governanca para planos superiores.',
    cta: 'Investir em governanca',
  },
  'stats:export': {
    title: 'Exportacao bloqueada',
    text: 'Relatorios exportaveis fazem parte dos recursos de inteligencia operacional.',
    cta: 'Desbloquear relatorios',
  },
  'contractors:manage': {
    title: 'Gestao multi-equipe bloqueada',
    text: 'Supervisao de prestadores subordinados exige a licenca Super Operacao.',
    cta: 'Evoluir para Super Operacao',
  },
};
