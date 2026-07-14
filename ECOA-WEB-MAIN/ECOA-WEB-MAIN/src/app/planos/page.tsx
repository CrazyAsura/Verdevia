import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import {
  BadgeCheck,
  Building2,
  Crown,
  Headphones,
  LineChart,
  ShieldCheck,
  Users,
} from 'lucide-react';

type Plan = {
  key: string;
  name: string;
  audience: string;
  price: string;
  description: string;
  href: string;
  icon: ReactNode;
  features: string[];
  highlighted?: boolean;
};

function envValue(key: string, fallback: string) {
  return process.env[key]?.trim() || fallback;
}

export const metadata = {
  title: 'Planos de Licenciamento Administrativo',
  description:
    'Licencas ECOA para acesso aos paineis administrativos, operacao de prestadores e monitoramento executivo.',
};

export default function PlansPage() {
  const plans: Plan[] = [
    {
      key: 'admin',
      name: envValue('WEB_PLAN_ADMIN_NAME', 'Licenca Administrador'),
      audience: envValue('WEB_PLAN_ADMIN_AUDIENCE', 'Secretarias, equipes internas e moderadores'),
      price: envValue('WEB_PLAN_ADMIN_PRICE', 'R$ 999/mes'),
      description: envValue(
        'WEB_PLAN_ADMIN_DESCRIPTION',
        'Acesso premium ao painel administrativo para triagem de denuncias, moderacao de forum e gestao de cursos.',
      ),
      href: '/autenticacao/administrador/login',
      icon: <ShieldCheck size={26} />,
      features: [
        'Painel administrativo completo',
        'Gestao de denuncias e status',
        'Cursos, forum e alertas operacionais',
        'Relatorios basicos de atividade',
      ],
    },
    {
      key: 'contractor',
      name: envValue('WEB_PLAN_CONTRACTOR_NAME', 'Licenca Prestador'),
      audience: envValue('WEB_PLAN_CONTRACTOR_AUDIENCE', 'Empresas de campo e equipes terceirizadas'),
      price: envValue('WEB_PLAN_CONTRACTOR_PRICE', 'R$ 1.299/mes'),
      description: envValue(
        'WEB_PLAN_CONTRACTOR_DESCRIPTION',
        'Licenca premium para receber missoes, acompanhar ordens de servico e registrar resolucao em campo.',
      ),
      href: '/autenticacao/prestadores/login',
      icon: <Building2 size={26} />,
      features: [
        'Terminal de prestador',
        'Ordens de servico atribuidas',
        'Mapa de operacoes e evidencias',
        'Historico de missoes concluidas',
      ],
      highlighted: true,
    },
    {
      key: 'super-contractor',
      name: envValue('WEB_PLAN_SUPER_CONTRACTOR_NAME', 'Licenca Super Operacao'),
      audience: envValue('WEB_PLAN_SUPER_CONTRACTOR_AUDIENCE', 'Holdings, consorcios e operacao multi-equipes'),
      price: envValue('WEB_PLAN_SUPER_CONTRACTOR_PRICE', 'R$ 1.999/mes'),
      description: envValue(
        'WEB_PLAN_SUPER_CONTRACTOR_DESCRIPTION',
        'Acesso executivo para supervisionar contratantes, SLA, alertas criticos e desempenho da rede.',
      ),
      href: '/autenticacao/super-prestadores/login',
      icon: <Crown size={26} />,
      features: [
        'Gestao de contratantes subordinados',
        'Monitoramento de SLA e risco',
        'Logs e telemetria de rede',
        'Indicadores executivos consolidados',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="relative min-h-[88vh] overflow-hidden pt-28">
        <Image
          src="/assets/super_admin_bg.png"
          alt="Painel administrativo ECOA"
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/55 via-background/90 to-background" />
        <div className="relative mx-auto flex min-h-[calc(88vh-7rem)] max-w-7xl flex-col justify-center px-6 pb-16">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <BadgeCheck size={14} /> Licencas de acesso ao sistema
            </div>
            <h1 className="text-5xl font-black uppercase italic leading-none tracking-tight md:text-7xl">
              Planos para operar o <span className="text-primary text-glow">painel ECOA</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-muted-foreground md:text-base">
              Na web, a ECOA vende licencas de uso premium para sustentar custos, investimento continuo,
              operacao de campo e supervisao executiva com alto nivel de acompanhamento.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.key}
              className={`flex min-h-[34rem] flex-col rounded-3xl border p-7 shadow-2xl transition-all ${
                plan.highlighted
                  ? 'border-primary/35 bg-primary/10 shadow-primary/10'
                  : 'border-border bg-card text-card-foreground'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-border bg-muted/60 p-4 text-primary">
                  {plan.icon}
                </div>
                {plan.highlighted && (
                  <span className="rounded-full bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black">
                    Mais usado
                  </span>
                )}
              </div>

              <div className="mt-7">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{plan.audience}</p>
                <h2 className="mt-3 text-2xl font-black uppercase tracking-tight">{plan.name}</h2>
                <p className="mt-3 min-h-16 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mt-8">
                <p className="text-4xl font-black tracking-tight">{plan.price}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">por licenca ativa</p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 flex h-12 items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  plan.highlighted
                    ? 'bg-primary text-black hover:bg-primary/90'
                    : 'border border-border bg-muted/50 text-foreground hover:border-primary/30 hover:text-primary'
                }`}
              >
                Acessar painel
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-28 md:grid-cols-3">
        <Benefit icon={<Users />} title="Usuarios por papel" text="Licencas separadas por administrador, prestador e supervisao executiva." />
        <Benefit icon={<LineChart />} title="Gestao e telemetria" text="Beneficios exclusivos para acompanhar operacao, SLA, denuncias e produtividade." />
        <Benefit icon={<Headphones />} title="Suporte operacional" text="Canais de recuperacao de acesso e suporte tecnico para ambientes administrativos." />
      </section>
    </main>
  );
}

function Benefit({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7 text-card-foreground">
      <div className="mb-5 text-primary">{icon}</div>
      <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
