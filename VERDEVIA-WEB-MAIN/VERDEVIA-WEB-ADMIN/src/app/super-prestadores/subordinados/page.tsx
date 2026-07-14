'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/complaints/ComplaintMap'), { ssr: false });
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Star,
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { encryptParam } from '@/lib/crypto';
import { redis } from '@/lib/redis';

interface Subordinate {
  id: string;
  name: string;
  activeProjects: number;
  resolved: number;
  rating: number;
  status: string;
  lastActivity: string;
}

export default function SubordinatesManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    async function loadSubordinates() {
      const cached = await redis.get('subordinates_list') as Subordinate[] | null;
      if (cached) {
        setSubordinates(cached);
        setLoading(false);
        return;
      }

      setTimeout(async () => {
        const data = [
          { id: '1', name: 'Engenharia Alfa Ltda', activeProjects: 12, resolved: 45, rating: 4.8, status: 'Ativo', lastActivity: '2h atrás' },
          { id: '2', name: 'Manutenção Beta S.A.', activeProjects: 8, resolved: 32, rating: 4.2, status: 'Ativo', lastActivity: '5h atrás' },
          { id: '3', name: 'Serviços Gama Construções', activeProjects: 15, resolved: 28, rating: 3.9, status: 'Em Análise', lastActivity: '1 dia atrás' },
          { id: '4', name: 'Infraestrutura Delta', activeProjects: 6, resolved: 19, rating: 4.5, status: 'Ativo', lastActivity: '30m atrás' },
        ];
        setSubordinates(data);
        await redis.set('subordinates_list', data, 120);
        setLoading(false);
      }, 600);
    }
    loadSubordinates();
  }, []);

  const filteredSubordinates = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return subordinates;

    return subordinates.filter((subordinate) =>
      subordinate.name.toLowerCase().includes(normalizedQuery) ||
      subordinate.status.toLowerCase().includes(normalizedQuery) ||
      subordinate.id.toLowerCase().includes(normalizedQuery)
    );
  }, [query, subordinates]);

  return (
    <DashboardLayout title="Gestão de Subordinados" role="super-contractor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/super-prestadores" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4">
              <ArrowLeft size={16} className="mr-2" />
              <span className="text-xs font-black uppercase tracking-widest">Voltar ao Dashboard</span>
            </Link>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Contratantes <span className="text-primary text-glow">Subordinados</span></h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Monitoramento e gestão de prestadores</p>
          </div>

          <Button asChild className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl px-6">
            <Link href="/super-prestadores/subordinados/create">
              <Plus size={18} className="mr-2" /> Novo Contratante
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#080808] border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Total Ativos</p>
                <h4 className="text-xl font-black">{subordinates.filter(s => s.status === 'Ativo').length}</h4>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Projetos Concluídos</p>
                <h4 className="text-xl font-black">{subordinates.reduce((sum, s) => sum + s.resolved, 0)}</h4>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Avaliação Média</p>
                <h4 className="text-xl font-black">{(subordinates.reduce((sum, s) => sum + s.rating, 0) / subordinates.length).toFixed(1)}</h4>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Em Análise</p>
                <h4 className="text-xl font-black">{subordinates.filter(s => s.status === 'Em Análise').length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Subordinates List */}
        <div className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight">Lista de <span className="text-primary">Contratantes</span></h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => handleQueryChange(event.target.value)}
                    placeholder="Buscar contratante..."
                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/2">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Contratante</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Projetos Ativos</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Resolvidos</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Avaliação</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Última Atividade</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-8">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredSubordinates.map((subordinate) => (
                    <motion.tr
                      key={subordinate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/1 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm">
                            {subordinate.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{subordinate.name}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: SUB-{subordinate.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{subordinate.activeProjects}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{subordinate.resolved}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-500 fill-current" />
                          <span className="text-sm text-white">{subordinate.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                          subordinate.status === 'Ativo' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {subordinate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{subordinate.lastActivity}</td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Link href={`/super-prestadores/subordinados/detalhes?sid=${encryptParam(subordinate.id)}`} title="Abrir contratante">
                            <MoreHorizontal size={16} />
                          </Link>
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
                {!loading && filteredSubordinates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                      Nenhum contratante encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Rede de <span className="text-primary">Impacto</span></h3>
          <ComplaintMap />
        </div>
      </div>
    </DashboardLayout>
  );
}
