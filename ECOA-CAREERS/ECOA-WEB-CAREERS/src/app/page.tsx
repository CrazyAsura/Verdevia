'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle,
  ClipboardList,
  HeartHandshake,
  Leaf,
  MapPin,
  Scale,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import JobsService, { Job } from '@/services/jobs.service';

const heroSlides = [
  {
    image: '/assets/amazon_forest.jpg',
    kicker: 'Tecnologia que cuida do território',
    title: 'Carreiras VerdeVia',
    copy: 'Trabalhe em produtos que conectam dados, sustentabilidade e resposta urbana em escala nacional.',
  },
  {
    image: '/assets/contractors_bg.png',
    kicker: 'Times de campo e produto juntos',
    title: 'Impacto real, todos os dias',
    copy: 'Aqui engenharia, operação e atendimento transformam evidências em decisões melhores para comunidades.',
  },
  {
    image: '/assets/brasilia.jpg',
    kicker: 'Privacidade desde a origem',
    title: 'Inscrição simples, sem conta',
    copy: 'Como no InHire: escolha a vaga, envie seus dados uma única vez e acompanhe o processo pelo nosso time.',
  },
];

const values = [
  {
    icon: Target,
    title: 'Missão',
    text: 'Aproximar pessoas, tecnologia e gestão ambiental para acelerar respostas urbanas confiáveis.',
  },
  {
    icon: Shield,
    title: 'Privacidade',
    text: 'Candidatura sem login para usuários comuns, com consentimento claro e retenção mínima de dados.',
  },
  {
    icon: Users,
    title: 'Colaboração',
    text: 'Produto, campo, dados e atendimento trabalham no mesmo fluxo, sem silos desnecessários.',
  },
  {
    icon: Leaf,
    title: 'Sustentabilidade',
    text: 'Decisões orientadas por impacto ambiental, inclusão operacional e melhoria contínua.',
  },
];

const benefits = [
  'Modelo híbrido conforme a vaga',
  'Trilhas de desenvolvimento e mentoria',
  'Ambiente orientado a produto, dados e impacto',
  'Processos com transparência e feedback humano',
  'Times multidisciplinares em arquitetura modular',
  'Benefícios alinhados ao contrato de cada posição',
];

const fallbackJobs: Job[] = [
  {
    id: 'fallback-sustainability-analyst',
    title: 'Analista de Sustentabilidade',
    description:
      'Apoiar diagnósticos ambientais, organizar indicadores de impacto e traduzir dados operacionais em planos de melhoria.',
    requirements:
      'Experiência com ESG, indicadores ambientais, relatórios executivos e boa comunicação com times técnicos e operação.',
    benefits:
      'Modelo híbrido, trilha de desenvolvimento, plano de saúde, vale refeição e participação em projetos nacionais.',
    location: 'São Paulo - SP',
    salary: 5200,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-product-engineer',
    title: 'Engenheiro(a) de Produto Pleno',
    description:
      'Construir módulos da plataforma VerdeVia em arquitetura limpa, com integrações seguras entre gateway, admin e serviços de domínio.',
    requirements:
      'Experiência com React, Next.js, NestJS, GraphQL, mensageria, testes e desenho de APIs orientadas a domínio.',
    benefits:
      'Stack moderna, autonomia técnica, mentoria, horário flexível e participação nas decisões de arquitetura.',
    location: 'Remoto - Brasil',
    salary: 9800,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-operations-lead',
    title: 'Lider de Operacoes Ambientais',
    description:
      'Coordenar rotinas de campo, priorizar chamados críticos e conectar equipes locais às métricas da plataforma.',
    requirements:
      'Vivência em operações urbanas, logística reversa, gestão de equipes e comunicação com stakeholders públicos.',
    benefits:
      'Seguro de vida, plano de carreira, ferramentas digitais de gestão e atuação direta em projetos de impacto.',
    location: 'Curitiba - PR',
    salary: 7400,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function CareersPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: '',
    linkedInUrl: '',
    lgpdConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    JobsService.getJobs()
      .then((data) => {
        const activeJobs = data.filter((job) => job.status === 'active' || !job.status);
        setJobs(activeJobs.length > 0 ? activeJobs : fallbackJobs);
      })
      .catch(() => setJobs(fallbackJobs))
      .finally(() => setLoading(false));
  }, []);

  const selectedJobDetails = selectedJob ?? jobs[0] ?? null;

  const stats = useMemo(
    () => [
      { label: 'Etapas simples', value: '3' },
      { label: 'Cadastro de candidato', value: '0' },
      { label: 'Retencao planejada', value: '6m' },
    ],
    [],
  );

  const updateForm = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const clearForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      resumeUrl: '',
      linkedInUrl: '',
      lgpdConsent: false,
    });
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setApplied(false);
    setError('');
    document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedJobDetails) return;
    if (!form.lgpdConsent) {
      setError('Voce precisa consentir com o tratamento dos dados para esta vaga.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await JobsService.applyForJob({
        jobId: selectedJobDetails.id,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        resumeUrl: form.resumeUrl,
        linkedInUrl: form.linkedInUrl || undefined,
        lgpdConsent: form.lgpdConsent,
      });
      setApplied(true);
      clearForm();
    } catch (err: any) {
      setError(err?.message || 'Nao foi possivel enviar sua candidatura agora.');
    } finally {
      setSubmitting(false);
    }
  };

  const slide = heroSlides[activeSlide];

  return (
    <main className="min-h-screen bg-background text-foreground mesh-gradient pb-24">
      <Header />

      <section className="relative min-h-[92vh] overflow-hidden pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.image}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover brightness-[0.38]"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-background/30 to-background" />
          </motion.div>
        </AnimatePresence>

        <div className="container relative z-10 mx-auto grid min-h-[calc(92vh-5rem)] grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-4 w-4" />
              {slide.kicker}
            </div>
            <h1 className="max-w-4xl text-5xl font-black uppercase italic tracking-tight text-white sm:text-7xl lg:text-8xl">
              {slide.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg">
              {slide.copy}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#vagas">
                <Button className="h-14 rounded-lg bg-gradient-to-r from-[#10B981] to-[#3B82F6] px-7 text-xs font-black uppercase tracking-widest text-white border-none glow-green">
                  Ver vagas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#inscricao">
                <Button variant="outline" className="h-14 rounded-lg border-white/20 bg-white/10 px-7 text-xs font-black uppercase tracking-widest text-white hover:bg-white/15">
                  Como se inscrever
                </Button>
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="glass rounded-lg p-4">
                  <p className="text-2xl font-black text-primary">{item.value}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="glass rounded-lg p-4">
            <div className="grid gap-3">
              {heroSlides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`group flex items-center gap-4 rounded-lg border p-3 text-left transition-all ${
                    activeSlide === index
                      ? 'border-primary/70 bg-primary/10'
                      : 'border-border/60 bg-background/30 hover:border-primary/40'
                  }`}
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
                    <Image src={item.image} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                      {item.copy}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="missao" className="container mx-auto px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              Missao, valores e cultura
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase italic tracking-tight md:text-6xl">
              O jeito VerdeVia de construir impacto
            </h2>
          </div>
          <p className="max-w-md text-sm font-medium leading-relaxed text-muted-foreground">
            Times pequenos, responsabilidades claras e arquitetura modular para que cada entrega chegue com seguranca, privacidade e qualidade operacional.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <article key={value.title} className="glass rounded-lg p-7">
              <value.icon className="mb-8 h-8 w-8 text-primary" />
              <h3 className="text-lg font-black uppercase tracking-tight">{value.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/35 py-20">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              Beneficios
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase italic tracking-tight md:text-5xl">
              Estrutura para crescer com autonomia
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Os beneficios variam por vaga e regime, mas a experiencia de trabalho segue o mesmo principio: contexto claro, seguranca psicologica e foco em resolver problemas reais.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/45 p-5">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm font-bold text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="vagas" className="container mx-auto px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              Vagas abertas
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase italic tracking-tight md:text-6xl">
              Escolha uma oportunidade
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-primary">
            <Scale className="h-4 w-4" />
            Sem login para candidatos
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">
            Carregando vagas...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className={`rounded-lg border bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-primary/50 ${
                  selectedJobDetails?.id === job.id ? 'border-primary/70 shadow-[0_24px_80px_-40px_#10B981]' : 'border-border/70'
                }`}
              >
                <Briefcase className="mb-6 h-7 w-7 text-primary" />
                <h3 className="min-h-14 text-xl font-black uppercase leading-tight tracking-tight">
                  {job.title}
                </h3>
                <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {job.location || 'Brasil'}
                  </span>
                  {job.salary ? <span>R$ {Number(job.salary).toLocaleString('pt-BR')}</span> : null}
                </div>
                <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
                <Button
                  type="button"
                  onClick={() => handleSelectJob(job)}
                  className="mt-7 h-11 w-full rounded-lg bg-primary text-xs font-black uppercase tracking-widest text-primary-foreground"
                >
                  Inscrever-se
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="inscricao" className="container mx-auto grid grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="glass rounded-lg p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            Como no InHire
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase italic tracking-tight">
            Uma candidatura direta, sem senha e sem conta
          </h2>
          <div className="mt-8 space-y-5">
            {[
              ['1', 'Escolha a vaga e confira requisitos, beneficios e localidade.'],
              ['2', 'Envie nome, contato e link do curriculo com consentimento LGPD.'],
              ['3', 'O time administrativo acompanha pelo gateway/admin e registra atividades internamente.'],
            ].map(([step, text]) => (
              <div key={step} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                  {step}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/10 p-5">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Dados de candidatos ficam salvos apenas para o processo seletivo. Logs de administradores, super administradores, erros e usuarios pertencem ao ambiente administrativo.
              </p>
            </div>
          </div>
        </aside>

        <form onSubmit={handleApply} className="rounded-lg border border-border/70 bg-card/60 p-7">
          <div className="mb-7 flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                Inscricao
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">
                {selectedJobDetails?.title || 'Selecione uma vaga'}
              </h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {selectedJobDetails?.location || 'Vaga VerdeVia'}
              </p>
            </div>
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>

          {selectedJobDetails ? (
            <>
              <div className="mb-7 grid gap-4 rounded-lg border border-border/60 bg-background/40 p-5 text-sm text-muted-foreground md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                    Requisitos
                  </p>
                  <p>{selectedJobDetails.requirements || 'Detalhes informados durante o processo seletivo.'}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                    Beneficios
                  </p>
                  <p>{selectedJobDetails.benefits || 'Beneficios conforme senioridade, localidade e regime da vaga.'}</p>
                </div>
              </div>

              {applied ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
                  <p className="text-sm font-black uppercase tracking-widest text-emerald-300">
                    Candidatura enviada
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Recebemos seus dados para esta vaga. O time de recrutamento fara a analise pelo ambiente administrativo.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nome completo">
                    <input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="career-input" placeholder="Seu nome" />
                  </Field>
                  <Field label="E-mail">
                    <input required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="career-input" placeholder="voce@email.com" />
                  </Field>
                  <Field label="Telefone">
                    <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} className="career-input" placeholder="(00) 00000-0000" />
                  </Field>
                  <Field label="LinkedIn">
                    <input type="url" value={form.linkedInUrl} onChange={(event) => updateForm('linkedInUrl', event.target.value)} className="career-input" placeholder="https://linkedin.com/in/..." />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Link do curriculo em PDF">
                      <input required type="url" value={form.resumeUrl} onChange={(event) => updateForm('resumeUrl', event.target.value)} className="career-input" placeholder="https://drive.google.com/..." />
                    </Field>
                  </div>

                  <label className="md:col-span-2 flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/40 p-4">
                    <input
                      type="checkbox"
                      required
                      checked={form.lgpdConsent}
                      onChange={(event) => updateForm('lgpdConsent', event.target.checked)}
                      className="mt-1 h-4 w-4 accent-emerald-500"
                    />
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      Consinto com o tratamento dos dados fornecidos para finalidade exclusiva de recrutamento e selecao desta vaga, conforme LGPD e orientacoes da ANPD.
                    </span>
                  </label>

                  {error ? <p className="md:col-span-2 text-xs font-bold text-red-400">{error}</p> : null}

                  <Button
                    type="submit"
                    disabled={submitting || !form.lgpdConsent}
                    className="md:col-span-2 h-12 rounded-lg bg-gradient-to-r from-[#10B981] to-[#3B82F6] text-xs font-black uppercase tracking-widest text-white border-none disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Enviar candidatura'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Escolha uma vaga acima para abrir o formulario de inscricao.
            </p>
          )}
        </form>
      </section>

      <footer className="container mx-auto px-6 pt-16 text-center">
        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
          <HeartHandshake className="h-4 w-4 text-primary" />
          VerdeVia Careers - candidatura direta e privacidade por desenho
        </div>
      </footer>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
