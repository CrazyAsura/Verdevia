'use client';

import Link from 'next/link';
import { LockKeyhole, TrendingUp } from 'lucide-react';
import { FEATURE_MARKETING_COPY, PlanFeature } from '@/lib/plan-access';

type LockedFeatureProps = {
  feature: PlanFeature;
  compact?: boolean;
  className?: string;
};

export function LockedFeature({ feature, compact = false, className = '' }: LockedFeatureProps) {
  const copy = FEATURE_MARKETING_COPY[feature] ?? {
    title: 'Recurso bloqueado',
    text: 'Para acessar este recurso, e necessario investir em um plano melhor.',
    cta: 'Ver planos',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-red-500/25 bg-red-950/10 ${compact ? 'p-4' : 'p-7'} ${className}`}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-red-500/10" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
          <LockKeyhole size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Plano superior</p>
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} mt-1 font-black uppercase tracking-tight text-white`}>
            {copy.title}
          </h3>
          <p className={`${compact ? 'mt-1 text-xs' : 'mt-3 text-sm'} max-w-2xl leading-6 text-slate-400`}>
            {copy.text} Para ter acesso, faca um investimento em um plano melhor.
          </p>
          <Link
            href="/planos"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-red-500 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-red-400"
          >
            <TrendingUp size={14} />
            {copy.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
