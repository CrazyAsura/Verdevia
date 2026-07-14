'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock3, MapPin, Send, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import JobsService, { Job } from '@/services/jobs.service';
import { fallbackJobs, jobTeam } from '@/lib/career-data';
import LocationService from '@/services/location.service';

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | undefined>(() => fallbackJobs.find((item) => item.id === decodeURIComponent(id)));
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [countries, setCountries] = useState<Array<{code:string;country:string;iso:string}>>([{code:'55',country:'Brasil',iso:'BR'}]);

  async function lookupCep(event: React.FocusEvent<HTMLInputElement>) {
    if (event.currentTarget.value.replace(/\D/g, '').length !== 8) return;
    setLocationHint('Consultando CEP…');
    try { const d=await LocationService.getCep(event.currentTarget.value); const f=event.currentTarget.form!; (f.elements.namedItem('zipCode') as HTMLInputElement).value=d.zipCode; (f.elements.namedItem('street') as HTMLInputElement).value=d.street; (f.elements.namedItem('district') as HTMLInputElement).value=d.district; (f.elements.namedItem('city') as HTMLInputElement).value=d.city; (f.elements.namedItem('state') as HTMLInputElement).value=d.state; setLocationHint(`${d.city}/${d.state}`); } catch(e) { setLocationHint(e instanceof Error?e.message:'CEP não encontrado'); }
  }

  async function lookupDdd(event: React.FocusEvent<HTMLInputElement>) {
    if (event.currentTarget.value.replace(/\D/g, '').length !== 2) return;
    setLocationHint('Validando DDD…');
    try { const d=await LocationService.getDdd(event.currentTarget.value); setLocationHint(`DDD ${d.ddd} · ${d.state}`); } catch(e) { setLocationHint(e instanceof Error?e.message:'DDD inválido'); }
  }

  useEffect(() => {
    JobsService.getJobs().then((jobs) => setJob(jobs.find((item) => item.id === decodeURIComponent(id)) || job)).catch(() => undefined);
    LocationService.getCountries().then(setCountries).catch(() => undefined);
  }, [id]);

  async function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job) return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true); setError('');
    try {
      await JobsService.applyForJob({ jobId: job.id, name: String(data.get('name')), email: String(data.get('email')), phones: [{ ddi: String(data.get('ddi')), ddd: String(data.get('ddd')), number: String(data.get('phoneNumber')) }], address: { zipCode:String(data.get('zipCode')), street:String(data.get('street')), number:String(data.get('addressNumber')), complement:String(data.get('complement')||'')||undefined, district:String(data.get('district')), city:String(data.get('city')), state:String(data.get('state')).toUpperCase(), country:'Brasil' }, resumeUrl: String(data.get('resumeUrl')), linkedInUrl: String(data.get('linkedInUrl') || '') || undefined, lgpdConsent: true });
      setSent(true);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar sua candidatura agora.');
    } finally { setSubmitting(false); }
  }

  if (!job) return <main className="min-h-screen"><Header /><div className="mx-auto max-w-3xl px-6 py-24 text-center"><h1 className="text-3xl font-black">Vaga não encontrada</h1><Link href="/" className="mt-5 inline-block font-bold text-primary">Voltar para vagas</Link></div></main>;

  return (
    <main className="min-h-screen bg-background"><Header />
      <div className="border-b border-border bg-card/45"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Todas as vagas</Link>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{jobTeam(job)}</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">{job.title}</h1>
        <div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{job.location}</span><span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />Tempo integral</span><span className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />CLT</span></div>
      </div></div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="space-y-10">
          <Section title="Sobre a posição"><p>{job.description}</p><p>Você fará parte de um time multidisciplinar, com autonomia para propor soluções e acompanhamento próximo das pessoas que usam o produto no dia a dia.</p></Section>
          <Section title="O que esperamos"><List text={job.requirements || 'Experiência compatível com a posição; colaboração, comunicação clara e compromisso com impacto.'} /></Section>
          <Section title="O que oferecemos"><List text={job.benefits || 'Ambiente colaborativo; desenvolvimento contínuo; benefícios compatíveis com o mercado.'} /></Section>
          <Section title="Como trabalhamos"><p>Organizamos o trabalho por objetivos, decisões registradas e ciclos curtos de aprendizado. Valorizamos perguntas bem feitas, feedback direto e tempo protegido para fazer um trabalho de qualidade.</p></Section>
        </article>
        <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Interessou?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A candidatura leva poucos minutos e não exige cadastro.</p>
          <button onClick={() => setFormOpen(true)} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90">Candidatar-se <Send className="h-4 w-4" /></button>
          <div className="mt-5 flex gap-3 border-t border-border pt-5"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p className="text-xs leading-5 text-muted-foreground">Seus dados serão usados somente para este processo seletivo, conforme nossa política de privacidade.</p></div>
        </aside>
      </div>

      {formOpen && <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setFormOpen(false)}><div className="mx-auto my-8 max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Candidatura</p><h2 className="mt-2 text-2xl font-black">{job.title}</h2></div><button onClick={() => setFormOpen(false)} className="text-sm font-bold text-muted-foreground">Fechar</button></div>
        {sent ? <div className="mt-8 rounded-xl bg-primary/10 p-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-primary" /><h3 className="mt-4 text-xl font-bold">Candidatura enviada</h3><p className="mt-2 text-sm text-muted-foreground">Recebemos seus dados. Nosso time entrará em contato caso seu perfil avance.</p></div> : <form onSubmit={apply} className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field label="Nome completo"><input name="name" required className="career-input" /></Field><Field label="E-mail"><input name="email" type="email" required className="career-input" /></Field>
          <div className="grid grid-cols-[110px_72px_1fr] gap-2 sm:col-span-2"><Field label="DDI"><select name="ddi" required defaultValue="55" className="career-input">{countries.map(c=><option key={`${c.iso}-${c.code}`} value={c.code}>+{c.code} {c.iso}</option>)}</select></Field><Field label="DDD"><input name="ddd" required maxLength={2} inputMode="numeric" onBlur={lookupDdd} className="career-input" /></Field><Field label="Telefone"><input name="phoneNumber" required inputMode="tel" className="career-input" placeholder="99999-9999" /></Field></div>
          {locationHint && <p className="text-xs font-semibold text-primary sm:col-span-2">{locationHint}</p>}
          <Field label="CEP"><input name="zipCode" required onBlur={lookupCep} className="career-input" placeholder="00000-000" /></Field><Field label="Rua"><input name="street" required className="career-input" /></Field><Field label="Número"><input name="addressNumber" required className="career-input" /></Field><Field label="Complemento"><input name="complement" className="career-input" /></Field><Field label="Bairro"><input name="district" required className="career-input" /></Field><Field label="Cidade"><input name="city" required className="career-input" /></Field><Field label="UF"><input name="state" required maxLength={2} className="career-input uppercase" /></Field><Field label="LinkedIn"><input name="linkedInUrl" type="url" className="career-input" placeholder="https://" /></Field><div className="sm:col-span-2"><Field label="Link do currículo"><input name="resumeUrl" type="url" required className="career-input" placeholder="Google Drive, Dropbox ou site pessoal" /></Field></div>
          <label className="flex gap-3 text-xs leading-5 text-muted-foreground sm:col-span-2"><input type="checkbox" required className="mt-1" />Li e concordo com o tratamento dos meus dados para esta candidatura.</label>{error && <p className="text-sm font-semibold text-red-500 sm:col-span-2">{error}</p>}<button disabled={submitting} className="h-12 rounded-lg bg-primary font-bold text-primary-foreground disabled:opacity-50 sm:col-span-2">{submitting ? 'Enviando…' : 'Enviar candidatura'}</button>
        </form>}
      </div></div>}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="mb-4 text-2xl font-black tracking-tight">{title}</h2><div className="space-y-4 text-base leading-7 text-muted-foreground">{children}</div></section>; }
function List({ text }: { text: string }) { return <ul className="space-y-3">{text.split(/[;\n]/).filter(Boolean).map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /><span>{item.trim()}</span></li>)}</ul>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-bold text-muted-foreground">{label}</span>{children}</label>; }
