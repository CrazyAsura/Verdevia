'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { hasAnyPlanFeature, PlanFeature } from '@/lib/plan-access';
import { LockedFeature } from './LockedFeature';

type PlanGateProps = {
  features: PlanFeature[];
  children: ReactNode;
  mode?: 'lock' | 'hide';
  compact?: boolean;
  className?: string;
};

export function PlanGate({ features, children, mode = 'lock', compact, className }: PlanGateProps) {
  const { user } = useAuth();
  const allowed = hasAnyPlanFeature(user, features);

  if (allowed) return <>{children}</>;
  if (mode === 'hide') return null;

  return <LockedFeature feature={features[0]} compact={compact} className={className} />;
}
