'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/complaints/ComplaintMap'), { ssr: false });
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { encryptParam } from '@/lib/crypto';
import { redis } from '@/lib/redis';

interface Complaint {
  id: string;
  title: string;
  address: string;
  status: string;
  priority: string;
  time: string;
}

export default function AssignedComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
    async function loadComplaints() {
      const cached = await redis.get('contractor_complaints') as Complaint[] | null;
      if (cached) {
        setComplaints(cached);
        setLoading(false);
        return;
      }

      setTimeout(async () => {
        const data = [
          { id: '2001', title: 'Tubulação Rompida', address: 'Av. Paulista, 1000', status: 'Em Rota', priority: 'Crítica', time: '10m' },
          { id: '2002', title: 'Iluminação Pública', address: 'Rua Augusta, 45', status: 'Pendente', priority: 'Média', time: '1h' },
          { id: '2003', title: 'Fenda no Asfalto', address: 'Rua da Consolação, 200', status: 'Em Análise', priority: 'Alta', time: '30m' },
          { id: '2004', title: 'Vazamento de Gás', address: 'Rua Oscar Freire, 12', status: 'Concluído', priority: 'Crítica', time: 'Ontem' },
        ];
        setComplaints(data);
        await redis.set('contractor_complaints', data, 60);
        setLoading(false);
      }, 700);
    }
    loadComplaints();
  }, []);

  return (
    <DashboardLayout title="Ordens de Serviço" role="contractor">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Link href="/prestadores" className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                 <ArrowLeft size={20} />
              </Link>
              <div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Minhas <span className="text-[#f59e0b] text-glow">Missões</span></h2>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestão de chamados e execução de reparos</p>
              </div>
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Em Serviço: Setor Centro</span>
           </div>
        </header>

        <div className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/1">
              <div className="relative flex-1 w-full">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input
                   type="text"
                   value={query}
                   onChange={(event) => handleQueryChange(event.target.value)}
                   placeholder="Buscar por ID ou Logradouro..."
                   className="w-full bg-black/40 border border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm focus:ring-1 focus:ring-[#f59e0b] focus:border-[#f59e0b] transition-all"
                 />
              </div>
              <Button
                onClick={() => setStatusFilter((current) => current ? null : 'Pendente')}
                variant="outline"
                className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl px-6 w-full md:w-auto"
              >
                 <Filter size={16} className="mr-2" /> {statusFilter ? 'Limpar Filtro' : 'Filtrar Status'}
              </Button>
           </div>

           <div className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-8 animate-pulse bg-white/1" />
                ))
              ) : (
                complaints
                  .filter((item) => {
                    const normalizedQuery = query.trim().toLowerCase();
                    const matchesQuery = !normalizedQuery || item.id.toLowerCase().includes(normalizedQuery) || item.address.toLowerCase().includes(normalizedQuery) || item.title.toLowerCase().includes(normalizedQuery);
                    const matchesStatus = !statusFilter || item.status === statusFilter;
                    return matchesQuery && matchesStatus;
                  })
                  .map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white/1 transition-all"
                  >
                     <div className="flex items-start gap-6">
                        <div className={`
                           w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                           ${item.priority === 'Crítica' ? 'bg-red-500/10 text-red-500' : 'bg-[#f59e0b]/10 text-[#f59e0b]'}
                        `}>
                           <ClipboardList size={28} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-white group-hover:text-[#f59e0b] transition-colors">{item.title}</h3>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                 item.priority === 'Crítica' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                 {item.priority}
                              </span>
                           </div>
                           <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                 <MapPin size={12} className="text-[#f59e0b]" /> {item.address}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                 <Clock size={12} /> {item.time}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                 <span className="text-slate-700">ID:</span> #{item.id}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-right hidden sm:block">
                           <p className="text-[10px] font-black uppercase text-slate-600 mb-1">Status Atual</p>
                           <p className={`text-xs font-bold uppercase tracking-tighter ${
                              item.status === 'Concluído' ? 'text-green-500' : 'text-[#f59e0b]'
                           }`}>{item.status}</p>
                        </div>
                        
                        <Link 
                          href={`/prestadores/denuncias/detalhes?id=${encryptParam(item.id)}`}
                          className="h-12 w-full md:w-48 bg-white/5 group-hover:bg-[#f59e0b] group-hover:text-black rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all gap-2"
                        >
                           Ver Missão <ChevronRight size={16} />
                        </Link>
                     </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>

        <div className="mt-12">
           <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Mapa de <span className="text-[#f59e0b]">Operações</span></h3>
           <ComplaintMap />
        </div>
      </div>
    </DashboardLayout>
  );
}

