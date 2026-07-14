'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { redis } from '@/lib/redis';
import { ArrowLeft, Save, X } from 'lucide-react';

interface Subordinate {
  id: string;
  name: string;
  activeProjects: number;
  resolved: number;
  rating: number;
  status: string;
  lastActivity: string;
}

export default function CreateSubordinatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Ativo');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cached = await redis.get('subordinates_list');
    const current = Array.isArray(cached) ? cached as Subordinate[] : [];
    const next: Subordinate = {
      id: String(Date.now()),
      name,
      activeProjects: 0,
      resolved: 0,
      rating: 5,
      status,
      lastActivity: 'Agora',
    };
    await redis.set('subordinates_list', [...current, next], 120);
    router.push('/super-prestadores/subordinados');
  };

  return (
    <DashboardLayout title="Novo Contratante" role="super-contractor">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <Link href="/super-prestadores/subordinados" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} className="mr-2" />
            <span className="text-xs font-black uppercase tracking-widest">Voltar à rede</span>
          </Link>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Novo <span className="text-primary text-glow">Contratante</span></h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cadastre uma equipe subordinada para monitoramento operacional</p>
        </header>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/5 bg-[#080808] p-8 space-y-6">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Nome da empresa</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ex: Infraestrutura Delta" className="bg-white/5 border-white/10 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Status inicial</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#080808] px-3 text-sm text-white outline-none focus:border-primary">
              <option>Ativo</option>
              <option>Em Análise</option>
            </select>
          </label>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push('/super-prestadores/subordinados')} className="border-white/10 text-slate-400 hover:text-white px-8">
              <X size={16} className="mr-2" /> Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest px-8">
              <Save size={16} className="mr-2" /> Salvar
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
