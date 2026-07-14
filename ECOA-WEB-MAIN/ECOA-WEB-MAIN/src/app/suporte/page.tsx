'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Headphones, Mail, MessageSquare, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SupportPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-[#050505] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/autenticacao/administrador/forgot-password" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Headphones size={26} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">Suporte Técnico ECOA</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Canal para recuperação de acesso administrativo, validação de identidade e incidentes de segurança.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon={<ShieldAlert size={18} />} title="SLA Crítico" text="Resposta em até 15 minutos para bloqueios de acesso." />
              <InfoCard icon={<Mail size={18} />} title="Contato" text="security@ECOA.br" />
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
            className="rounded-3xl border border-white/5 bg-[#080808] p-6 sm:p-8 shadow-2xl"
          >
            <h2 className="mb-6 text-lg font-black uppercase tracking-tight">Abrir Chamado</h2>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail operacional</label>
                <Input type="email" required placeholder="admin@ECOA.br" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Tipo de incidente</label>
                <select required className="h-11 w-full rounded-xl border border-white/10 bg-[#080808] px-3 text-sm text-white outline-none focus:border-primary">
                  <option>Recuperação de acesso</option>
                  <option>Suspeita de credencial comprometida</option>
                  <option>Erro em painel administrativo</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição</label>
                <Textarea required rows={5} placeholder="Descreva o que aconteceu e informe o painel afetado." className="bg-white/5 border-white/10 text-white resize-none" />
              </div>
              {sent && (
                <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-xs font-bold text-primary">
                  <CheckCircle2 size={18} /> Chamado registrado para triagem técnica.
                </div>
              )}
              <Button type="submit" className="h-12 w-full bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest">
                <MessageSquare size={16} className="mr-2" /> Enviar Chamado
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
      <div className="mb-3 text-primary">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-bold text-white">{text}</p>
    </div>
  );
}
