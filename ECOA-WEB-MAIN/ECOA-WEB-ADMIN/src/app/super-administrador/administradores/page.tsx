'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/complaints/ComplaintMap'), { ssr: false });
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  ArrowLeft,
  Filter,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { encryptParam } from '@/lib/crypto';
import { showToast } from '@/lib/toast';
import AdminsService from '@/services/admins.service';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastSeen: string;
}

type AdminFilter = 'all' | 'senior' | 'auditors' | 'inactive';

export default function AdminsManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState<AdminFilter>('all');

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
    async function loadAdmins() {
      try {
        const data = await AdminsService.getAdmins();
        setAdmins(data);
        setLoading(false);
      } catch {
        showToast('Não foi possível carregar administradores.', 'error');
        setLoading(false);
      }
    }
    loadAdmins();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este administrador? Esta ação é irreversível.')) {
      try {
        await AdminsService.deleteAdmin(id);
        setAdmins((current) => current.filter(a => a.id !== id));
        showToast('Administrador removido com sucesso.', 'success');
      } catch {
        showToast('Não foi possível remover o administrador.', 'error');
      }
    }
  };

  const matchesAdminFilter = (admin: Admin, filter: AdminFilter) => {
    if (filter === 'senior') return /global|regional/i.test(admin.role);
    if (filter === 'auditors') return /audit|auditor/i.test(admin.role);
    if (filter === 'inactive') return /dia|semana|mês|mes/i.test(admin.lastSeen);
    return true;
  };

  const filteredAdmins = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return admins.filter((admin) => {
      const matchesQuery =
        !normalizedQuery ||
        admin.name.toLowerCase().includes(normalizedQuery) ||
        admin.email.toLowerCase().includes(normalizedQuery) ||
        admin.role.toLowerCase().includes(normalizedQuery);
      return matchesQuery && matchesAdminFilter(admin, activeFilter);
    });
  }, [admins, activeFilter, query]);

  const filterCounts = React.useMemo(() => ({
    all: admins.length,
    senior: admins.filter((admin) => matchesAdminFilter(admin, 'senior')).length,
    auditors: admins.filter((admin) => matchesAdminFilter(admin, 'auditors')).length,
    inactive: admins.filter((admin) => matchesAdminFilter(admin, 'inactive')).length,
  }), [admins]);

  const handleExport = () => {
    const header = 'id,nome,email,cargo,ultimo_acesso';
    const rows = admins.map((admin) => [admin.id, admin.name, admin.email, admin.role, admin.lastSeen].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'administradores-ECOA.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Gestão de Administradores" role="super-admin">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Link href="/super-administrador" className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                 <ArrowLeft size={20} />
              </Link>
              <div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Administradores <span className="text-primary text-glow">ECOA</span></h2>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Controle total de permissões e acessos</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <Button onClick={handleExport} variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl">
                 <Download size={16} className="mr-2" /> Exportar
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl px-6">
                 <Link href="/super-administrador/administradores/create">
                   <Plus size={18} className="mr-2" /> Novo Admin
                 </Link>
              </Button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Filters Sidebar */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#080808] border border-white/5 rounded-3xl p-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                    <Filter size={14} /> Filtros Rápidos
                 </h3>
                 <div className="space-y-4">
                    <FilterItem label="Todos" count={filterCounts.all} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                    <FilterItem label="Sênior" count={filterCounts.senior} active={activeFilter === 'senior'} onClick={() => setActiveFilter('senior')} />
                    <FilterItem label="Auditores" count={filterCounts.auditors} active={activeFilter === 'auditors'} onClick={() => setActiveFilter('auditors')} />
                    <FilterItem label="Inativos" count={filterCounts.inactive} active={activeFilter === 'inactive'} onClick={() => setActiveFilter('inactive')} />
                 </div>
              </div>
           </div>

           {/* Table Content */}
           <div className="lg:col-span-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
              >
                 <div className="p-6 border-b border-white/5 bg-white/1">
                    <div className="relative">
                       <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                       <input 
                         type="text" 
                         value={query}
                         onChange={(event) => handleQueryChange(event.target.value)}
                         placeholder="Buscar por nome, e-mail ou cargo..." 
                         className="w-full bg-black/40 border border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                       />
                    </div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-white/2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                          <tr>
                             <th className="px-8 py-5">Perfil</th>
                             <th className="px-8 py-5">Nível de Acesso</th>
                             <th className="px-8 py-5">Atividade</th>
                             <th className="px-8 py-5 text-right">Ações</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {loading ? (
                             Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                   <td colSpan={4} className="px-8 py-8 h-20 bg-white/1" />
                                </tr>
                             ))
                          ) : (
                             filteredAdmins.map((admin) => (
                                <tr key={admin.id} className="group hover:bg-white/1 transition-colors">
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary">
                                            {admin?.name?.[0] || 'A'}
                                         </div>
                                         <div>
                                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{admin?.name || 'Sem Nome'}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                               <Mail size={10} /> {admin.email}
                                            </div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-2">
                                         <Shield size={14} className="text-blue-500" />
                                         <span className="text-xs text-slate-300 font-medium">{admin.role}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{admin.lastSeen}</span>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                         {/* Using Encrypted ID in URL */}
                                         <Link 
                                           href={`/super-administrador/administradores/edit?uid=${encryptParam(admin.id)}`}
                                           className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-slate-500"
                                         >
                                            <MoreHorizontal size={18} />
                                         </Link>
                                         <button 
                                           onClick={() => handleDelete(admin.id)}
                                           className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-slate-500"
                                         >
                                            <Trash2 size={16} />
                                         </button>
                                      </div>
                                   </td>
                                </tr>
                             ))
                          )}
                          {!loading && filteredAdmins.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-8 py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                                Nenhum administrador encontrado.
                              </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
           </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 text-glow">Visão Global de <span className="text-primary">Monitoramento</span></h3>
          <ComplaintMap />
        </div>
      </div>
    </DashboardLayout>
  );
}

function FilterItem({ label, count, active = false, onClick }: { label: string, count: number, active?: boolean, onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`
       w-full
       flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
       ${active ? 'bg-primary/10 border border-primary/20 text-primary' : 'hover:bg-white/5 text-slate-400'}
    `}>
       <span className="text-xs font-bold">{label}</span>
       <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded-full">{count}</span>
    </button>
  );
}
