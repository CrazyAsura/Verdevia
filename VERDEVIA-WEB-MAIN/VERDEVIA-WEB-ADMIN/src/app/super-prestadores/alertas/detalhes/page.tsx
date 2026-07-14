'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { decryptParam } from '@/lib/crypto';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, MapPin, ShieldAlert, Users } from 'lucide-react';

const alerts = [
  { id: '1', site: 'Setor Leste', issue: 'Tubulação Rompida', days: 5, risk: 'Crítico', contractor: 'Engenharia Alfa Ltda', sla: 'SLA vencido há 48h' },
  { id: '2', site: 'Setor Oeste', issue: 'Pavimentação Incompleta', days: 3, risk: 'Médio', contractor: 'Manutenção Beta S.A.', sla: 'SLA em observação' },
];

export default function SuperContractorAlertDetailPage() {
  const searchParams = useSearchParams();
  const alertId = useMemo(() => decryptParam(searchParams.get('aid') ?? ''), [searchParams]);
  const alert = alerts.find((item) => item.id === alertId) ?? alerts[0];

  return (
    <DashboardLayout title="Detalhes do Alerta SLA" role="super-contractor">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/super-prestadores" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Alerta <span className="text-red-500">#{alert.id}</span></h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">{alert.issue}</p>
            </div>
          </div>
          <Button asChild className="h-12 bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] rounded-xl px-6">
            <Link href="/super-prestadores/subordinados">
              <Users size={16} className="mr-2" /> Ver Contratantes
            </Link>
          </Button>
        </header>

        <section className="grid gap-6 md:grid-cols-4">
          <Metric icon={<MapPin />} label="Local" value={alert.site} />
          <Metric icon={<Clock />} label="Tempo Aberto" value={`${alert.days} dias`} />
          <Metric icon={<ShieldAlert />} label="Risco" value={alert.risk} danger={alert.risk === 'Crítico'} />
          <Metric icon={<AlertTriangle />} label="SLA" value={alert.sla} danger />
        </section>

        <section className="rounded-3xl border border-white/5 bg-[#080808] p-8">
          <h2 className="mb-6 text-lg font-black uppercase tracking-tight">Plano de Intervenção</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {['Acionar responsável técnico', 'Repriorizar fila operacional', 'Registrar atualização no log'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/5 bg-white/3 p-5">
                <CheckCircle2 className="mb-4 text-primary" size={20} />
                <p className="text-sm font-bold text-slate-200">{item}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Ação disponível para coordenação do super-contratante.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-[#080808] p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contratante responsável</p>
          <p className="mt-2 text-2xl font-black text-white">{alert.contractor}</p>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Metric({ icon, label, value, danger = false }: { icon: React.ReactNode; label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#080808] p-6">
      <div className={danger ? 'mb-4 text-red-500' : 'mb-4 text-primary'}>{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
