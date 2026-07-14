'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Bell, Search, Plus } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: React.ElementType, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-r-4 ${active ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-white/5 border-transparent text-muted-foreground'}`}>
    <Icon size={20} />
    <span className="uppercase text-[10px] font-black tracking-[0.2em]">{label}</span>
  </div>
);

export default function DashboardV2() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar - Brutalist Style */}
      <aside className="w-64 border-r border-white/5 flex flex-col pt-12">
        <div className="px-8 mb-16">
          <h2 className="text-2xl font-black italic tracking-tighter">ECOA <span className="text-primary">OS</span></h2>
          <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Terminal de Comando v2.0</p>
        </div>

        <nav className="flex-1">
          <SidebarItem icon={LayoutDashboard} label="Overview" active />
          <SidebarItem icon={Users} label="Comunidade" />
          <SidebarItem icon={MessageSquare} label="Ocorrências" />
          <SidebarItem icon={Settings} label="Configurações" />
        </nav>

        <div className="p-8">
           <div className="p-6 bg-white/5 border border-white/5 rounded-none mb-8">
              <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mb-2">Storage Status</p>
              <div className="h-1 w-full bg-white/10 mb-2">
                <div className="h-full bg-primary w-[65%]" />
              </div>
              <p className="text-[10px] font-bold">1.2 TB / 2.0 TB</p>
           </div>
           <SidebarItem icon={LogOut} label="Sair do Terminal" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12">
           <div className="relative w-96 group">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input 
               type="text" 
               placeholder="Pesquisar na rede..." 
               className="w-full h-12 bg-white/5 border-none rounded-none pl-12 text-sm uppercase tracking-widest font-bold focus:ring-1 focus:ring-primary outline-none" 
             />
           </div>

           <div className="flex items-center gap-8">
              <div className="relative">
                <Bell size={20} className="text-muted-foreground cursor-pointer hover:text-white transition-colors" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              </div>
              <div className="flex items-center gap-4 border-l border-white/5 pl-8">
                 <div className="text-right">
                    <p className="text-xs font-black uppercase italic tracking-tighter">Leon Administrator</p>
                    <p className="text-[8px] uppercase font-bold text-primary tracking-widest">Master Access</p>
                 </div>
                 <div className="w-10 h-10 bg-primary/20 rounded-none border border-primary/40 flex items-center justify-center text-primary font-black">
                    L
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <section className="p-12 overflow-y-auto">
          <div className="flex justify-between items-end mb-12">
             <div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Painel de <span className="text-primary text-glow">Controle</span></h1>
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground">Monitoramento em tempo real • Global Cluster</p>
             </div>
             <button className="h-14 px-8 bg-primary text-black font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-[0_10px_30px_-10px_#20c997]">
                <Plus size={18} /> Nova Operação
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Large Chart Placeholder */}
             <div className="md:col-span-2 aspect-video bg-white/5 border border-white/5 p-8 relative group overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-l-2 border-primary pl-4">Impacto Mensal Georreferenciado</h3>
                <div className="w-full h-[80%] border-b border-l border-white/10 flex items-end gap-2 p-4">
                   {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                     <motion.div 
                       key={i}
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       transition={{ delay: i * 0.1, duration: 1 }}
                       className="flex-1 bg-primary/20 border-t border-primary/40 relative group/bar"
                     >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity">{h}%</div>
                     </motion.div>
                   ))}
                </div>
             </div>

             {/* Side Stats */}
             <div className="space-y-8">
                <div className="p-8 bg-primary text-black">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-4">Total de Incidentes Resolvidos</p>
                   <p className="text-6xl font-black italic tracking-tighter">14,802</p>
                   <p className="text-[10px] font-bold mt-4">+12.5% em relação ao mês anterior</p>
                </div>
                <div className="p-8 bg-white/5 border border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Média de Resposta</p>
                   <p className="text-4xl font-black italic tracking-tighter">8.4 MIN</p>
                   <div className="flex gap-1 mt-6">
                      {[1,1,1,1,1,0,0,0,0,0].map((b, i) => (
                        <div key={i} className={`h-1 flex-1 ${b ? 'bg-primary' : 'bg-white/10'}`} />
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </section>
      </div>
    </main>
  );
}


