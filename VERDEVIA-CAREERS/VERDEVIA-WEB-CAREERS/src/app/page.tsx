'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, ChevronRight, Clock3, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/Header';
import JobsService, { Job } from '@/services/jobs.service';
import { fallbackJobs, jobTeam, teams } from '@/lib/career-data';

export default function CareersPortal() {
  const [jobs, setJobs] = useState<Job[]>(fallbackJobs);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState(teams[0]);
  const [workMode, setWorkMode] = useState('Todos os modelos');

  useEffect(() => {
    JobsService.getJobs().then((data) => {
      const active = data.filter((job) => !job.status || job.status === 'active');
      if (active.length) setJobs(active);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => jobs.filter((job) => {
    const haystack = `${job.title} ${job.description} ${job.location}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesTeam = team === teams[0] || jobTeam(job) === team;
    const location = (job.location || '').toLowerCase();
    const matchesMode = workMode === 'Todos os modelos' || location.includes(workMode.toLowerCase());
    return matchesQuery && matchesTeam && matchesMode;
  }), [jobs, query, team, workMode]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="border-b border-border bg-card/45">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">Oportunidades abertas</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Encontre seu próximo desafio na VERDEVIA.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Explore as posições, conheça o escopo de cada time e candidate-se sem precisar criar uma conta.</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
              <div><strong className="block text-xl leading-none">{jobs.length}</strong><span className="text-xs text-muted-foreground">vagas abertas</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <div className="mb-5 flex items-center gap-2 font-bold"><SlidersHorizontal className="h-4 w-4 text-primary" /> Filtros</div>
          <Filter label="Time" value={team} onChange={setTeam} options={teams} />
          <Filter label="Modelo de trabalho" value={workMode} onChange={setWorkMode} options={['Todos os modelos', 'Remoto', 'Híbrido']} />
          <button type="button" onClick={() => { setTeam(teams[0]); setWorkMode('Todos os modelos'); setQuery(''); }} className="mt-5 text-sm font-semibold text-primary hover:underline">Limpar filtros</button>
          <div className="mt-7 border-t border-border pt-6">
            <p className="text-sm font-bold">Não encontrou sua vaga?</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Novas posições são publicadas aqui assim que os times abrem uma oportunidade.</p>
            <Link href="/processo" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">Entenda o processo <ChevronRight className="h-3 w-3" /></Link>
          </div>
        </aside>

        <section aria-labelledby="jobs-heading">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Busque por cargo, área ou localidade" />
          </label>
          <div className="mb-4 mt-7 flex items-center justify-between">
            <h2 id="jobs-heading" className="text-lg font-bold">{filtered.length} {filtered.length === 1 ? 'oportunidade' : 'oportunidades'}</h2>
            {loading && <span className="text-xs text-muted-foreground">Atualizando vagas…</span>}
          </div>
          <div className="space-y-3">
            {filtered.map((job) => (
              <Link key={job.id} href={`/vagas/${encodeURIComponent(job.id)}`} className="group block rounded-xl border border-border bg-card p-5 transition hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 sm:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{jobTeam(job)}</span>
                    <h3 className="mt-2 text-xl font-bold tracking-tight group-hover:text-primary">{job.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location || 'Brasil'}</span>
                      <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />Tempo integral</span>
                    </div>
                    <p className="mt-4 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">{job.description}</p>
                  </div>
                  <span className="mt-1 rounded-full border border-border p-2 transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"><ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
            {!filtered.length && <div className="rounded-xl border border-dashed border-border p-12 text-center"><p className="font-bold">Nenhuma vaga corresponde aos filtros.</p><p className="mt-2 text-sm text-muted-foreground">Tente buscar por outro termo ou ampliar os filtros.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="mb-5 block"><span className="mb-2 block text-xs font-bold text-muted-foreground">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
