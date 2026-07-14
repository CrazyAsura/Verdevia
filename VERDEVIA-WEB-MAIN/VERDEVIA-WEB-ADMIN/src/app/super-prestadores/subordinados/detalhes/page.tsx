'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { decryptParam } from '@/lib/crypto';
import { redis } from '@/lib/redis';
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock, Star, TrendingUp } from 'lucide-react';

interface Subordinate {
  id: string;
  name: string;
  activeProjects: number;
  resolved: number;
  rating: number;
  status: string;
  lastActivity: string;
}

const fallback: Subordinate[] = [
  { id: '1', name: 'Engenharia Alfa Ltda', activeProjects: 12, resolved: 45, rating: 4.8, status: 'Ativo', lastActivity: '2h atrás' },
  { id: '2', name: 'Manutenção Beta S.A.', activeProjects: 8, resolved: 32, rating: 4.2, status: 'Ativo', lastActivity: '5h atrás' },
  { id: '3', name: 'Serviços Gama Construções', activeProjects: 15, resolved: 28, rating: 3.9, status: 'Em Análise', lastActivity: '1 dia atrás' },
];

export default function SubordinateDetailPage() {
  const searchParams = useSearchParams();
  const subordinateId = useMemo(() => decryptParam(searchParams.get('sid') ?? ''), [searchParams]);
  const [subordinate, setSubordinate] = useState<Subordinate | null>(null);

  useEffect(() => {
    async function load() {
      const cached = await redis.get('subordinates_list');
      const list = Array.isArray(cached) ? cached as Subordinate[] : fallback;
      setSubordinate(list.find((item) => item.id === subordinateId) ?? fallback[0]);
    }
    load();
  }, [subordinateId]);

  return (
    <DashboardLayout title="Detalhes do Contratante" role="super-contractor">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <Link href="/super-prestadores/subordinados" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} className="mr-2" />
            <span className="text-xs font-black uppercase tracking-widest">Voltar à rede</span>
          </Link>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">{subordinate?.name ?? 'Contratante'}</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID operacional: SUB-{subordinate?.id ?? '--'}</p>
        </header>

        <section className="grid gap-6 md:grid-cols-4">
          <Metric icon={<BriefcaseBusiness />} label="Projetos Ativos" value={String(subordinate?.activeProjects ?? '--')} />
          <Metric icon={<CheckCircle2 />} label="Resolvidos" value={String(subordinate?.resolved ?? '--')} />
          <Metric icon={<Star />} label="Avaliação" value={String(subordinate?.rating ?? '--')} />
          <Metric icon={<Clock />} label="Última Atividade" value={subordinate?.lastActivity ?? '--'} />
        </section>

        <section className="rounded-3xl border border-white/5 bg-[#080808] p-8">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <TrendingUp size={18} className="text-primary" /> Telemetria Operacional
          </h2>
          <div className="space-y-5">
            <Progress label="Capacidade de resposta" value={88} />
            <Progress label="Cumprimento de SLA" value={76} />
            <Progress label="Qualidade de resolução" value={92} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#080808] p-6">
      <div className="mb-4 text-primary">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
