'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Users, 
  History, 
  BellRing,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { encryptParam } from '@/lib/crypto';

const ComplaintMap = dynamic(() => import('@/components/complaints/ComplaintMap'), { ssr: false });

export default function SuperContractorDashboard() {
  const [subordinates] = React.useState([
    { id: '1', name: 'Engenharia Alfa', activeProjects: 12, resolved: 45, rating: 4.8 },
    { id: '2', name: 'Manutenção Beta', activeProjects: 8, resolved: 32, rating: 4.2 },
    { id: '3', name: 'Serviços Gama', activeProjects: 15, resolved: 28, rating: 3.9 },
  ]);

  const [unresolved] = React.useState([
    { id: '1', site: 'Setor Leste', issue: 'Tubulação Rompida', days: 5, risk: 'Crítico' },
    { id: '2', site: 'Setor Oeste', issue: 'Pavimentação Incompleta', days: 3, risk: 'Médio' },
  ]);

  return (
    <DashboardLayout title="Terminal Super-Contratante" role="super-contractor">
      <div className="space-y-8">
        {/* Top Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <IndicatorCard 
             icon={<BellRing className="text-red-500" />} 
             label="Alertas Críticos" 
             value={unresolved.filter(u => u.risk === 'Crítico').length.toString()} 
             color="red"
           />
           <IndicatorCard 
             icon={<Users className="text-blue-500" />} 
             label="Contratantes Subordinados" 
             value={subordinates.length.toString()} 
             color="blue"
           />
           <IndicatorCard 
             icon={<BarChart3 className="text-[#a855f7]" />} 
             label="Eficácia Global" 
             value="82%" 
             color="purple"
           />
        </div>

        {/* Management Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Gestão de <span className="text-primary text-glow">Operações</span></h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Monitoramento e controle de contratantes</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl px-6">
            <Link href="/super-prestadores/subordinados">
              <Users size={18} className="mr-2" /> Gerenciar Subordinados
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Unresolved Complaints Monitoring */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="lg:col-span-2 bg-[#080808] border border-white/5 rounded-3xl p-8"
           >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                       <ShieldAlert size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black uppercase tracking-tight">Queixas <span className="text-red-500">Não Resolvidas</span></h3>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ocorrências pendentes além do SLA</p>
                    </div>
                 </div>
              </div>

              <div className="overflow-hidden border border-white/5 rounded-2xl">
                 <table className="w-full">
                    <thead className="bg-white/2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                       <tr>
                          <th className="px-6 py-4 text-left">Local</th>
                          <th className="px-6 py-4 text-left">Problema</th>
                          <th className="px-6 py-4 text-left">Tempo</th>
                          <th className="px-6 py-4 text-left">Risco</th>
                          <th className="px-6 py-4 text-right">Ação</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {unresolved.map((item) => (
                          <tr key={item.id} className="hover:bg-white/1 transition-colors">
                             <td className="px-6 py-4 text-xs font-bold text-white">{item.site}</td>
                             <td className="px-6 py-4 text-xs text-slate-400">{item.issue}</td>
                             <td className="px-6 py-4 text-xs text-slate-500">{item.days} dias</td>
                             <td className="px-6 py-4">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                   item.risk === 'Crítico' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>{item.risk}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <Link
                                  href={`/super-prestadores/alertas/detalhes?aid=${encryptParam(item.id)}`}
                                  className="inline-flex p-2 text-slate-600 hover:text-white transition-colors"
                                  title="Abrir alerta"
                                >
                                  <ExternalLink size={16} />
                                </Link>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </motion.div>

            {/* Subordinate Logs */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#080808] border border-white/5 rounded-3xl p-8"
            >
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest">Logs de <span className="text-[#a855f7]">Subordinados</span></h3>
                  <Link href="/super-prestadores/logs" className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                     <History size={18} />
                  </Link>
               </div>
               
               <div className="space-y-6">
                  {subordinates.map((sub) => (
                     <div key={sub.id} className="p-4 bg-white/2 border border-white/5 rounded-xl group hover:border-[#a855f7]/30 transition-all">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="text-xs font-black uppercase tracking-tight">{sub.name}</h4>
                           <span className="text-[9px] font-bold text-[#a855f7]">Nota: {sub.rating}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[8px] uppercase text-slate-600 font-bold mb-1">Projetos</p>
                              <p className="text-xs font-bold">{sub.activeProjects}</p>
                           </div>
                           <div>
                              <p className="text-[8px] uppercase text-slate-600 font-bold mb-1">Resolvidos</p>
                              <p className="text-xs font-bold text-green-500">{sub.resolved}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="mt-6">
                  <Button asChild variant="outline" className="w-full border-white/5 hover:bg-white/5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
                     <Link href="/super-prestadores/logs">
                        Ver Logs e Telemetria
                     </Link>
                  </Button>
               </div>
            </motion.div>
        </div>

        {/* Global Overview Map */}
        <div className="h-[600px] w-full rounded-3xl overflow-hidden relative border border-white/5">
           <ComplaintMap />
        </div>
      </div>
    </DashboardLayout>
  );
}

function IndicatorCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500/5 border-red-500/10',
    blue: 'bg-blue-500/5 border-blue-500/10',
    purple: 'bg-[#a855f7]/5 border-[#a855f7]/10'
  };

  return (
    <div className={`${colorMap[color]} border p-8 rounded-3xl flex items-center justify-between group`}>
       <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</p>
          <h4 className="text-4xl font-black">{value}</h4>
       </div>
       <div className="p-4 bg-white/5 rounded-2xl group-hover:rotate-12 transition-transform">
          {icon}
       </div>
    </div>
  );
}

