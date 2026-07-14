'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  History, 
  Plus, 
  Trash2, 
  Edit3, 
  Activity,
  ShieldCheck,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';

const ComplaintMap = dynamic(() => import('@/components/complaints/ComplaintMap'), { ssr: false });

interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: string;
  lastLogin: string;
}

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: '1', name: 'Ricardo Santos', email: 'ricardo@ECOA.br', status: 'Ativo', lastLogin: '10 min atrás' },
    { id: '2', name: 'Ana Oliveira', email: 'ana@ECOA.br', status: 'Ativo', lastLogin: '2 horas atrás' },
    { id: '3', name: 'Marcos Lima', email: 'marcos@ECOA.br', status: 'Inativo', lastLogin: '3 dias atrás' },
  ]);

  const [logs, setLogs] = useState([
    { id: '1', user: 'Ricardo Santos', action: 'Criou novo curso', time: '14:20', date: '24 Abr' },
    { id: '2', user: 'Ana Oliveira', action: 'Aprovou queixa #442', time: '13:15', date: '24 Abr' },
    { id: '3', user: 'Admin System', action: 'Backup de segurança concluído', time: '04:00', date: '24 Abr' },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', status: 'Ativo' });

  const handleOpenCreate = () => {
    setFormData({ name: '', email: '', status: 'Ativo' });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({ name: admin.name, email: admin.email, status: admin.status });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newAdmin: AdminUser = {
        id: String(Date.now()),
        name: formData.name,
        email: formData.email,
        status: formData.status,
        lastLogin: 'Agora mesmo'
      };
      setAdmins(prev => [...prev, newAdmin]);
      setLogs(prev => [
        {
          id: String(Date.now()),
          user: 'Super Admin',
          action: `Adicionou o administrador: ${newAdmin.name}`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: 'Hoje'
        },
        ...prev
      ]);
    } else if (modalMode === 'edit' && editingAdmin) {
      setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? { ...a, ...formData } : a));
      setLogs(prev => [
        {
          id: String(Date.now()),
          user: 'Super Admin',
          action: `Atualizou dados do administrador: ${formData.name}`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: 'Hoje'
        },
        ...prev
      ]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Deseja revogar o acesso do administrador ${name}?`)) {
      setAdmins(prev => prev.filter(a => a.id !== id));
      setLogs(prev => [
        {
          id: String(Date.now()),
          user: 'Super Admin',
          action: `Revogou acesso do administrador: ${name}`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: 'Hoje'
        },
        ...prev
      ]);
      showToast(`Acesso de ${name} revogado.`, 'success');
    }
  };

  return (
    <DashboardLayout title="Terminal Super-Admin" role="super-admin">
      <div className="space-y-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard icon={<ShieldCheck className="text-primary" />} label="Sistemas Ativos" value="98.2%" trend="+1.2%" />
           <StatCard icon={<Users className="text-blue-500" />} label="Total Administradores" value={admins.length.toString()} />
           <StatCard icon={<Activity className="text-red-500" />} label="Logs Hoje" value={logs.length.toString()} trend="+42" />
           <StatCard icon={<History className="text-purple-500" />} label="Uptime Servidores" value="99.99%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Management CRUD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-[#080808]/85 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
          >
            <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Gestão de <span className="text-primary">Administradores</span></h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Controle de acesso e privilégios</p>
               </div>
               <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl transition-all active:scale-95">
                 <Plus size={16} className="mr-2" /> Novo Admin
               </Button>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[800px]">
                   <thead className="bg-white/2 text-[10px] uppercase font-black tracking-widest text-slate-500">
                      <tr>
                         <th className="px-8 py-5 text-left">Identificação</th>
                         <th className="px-8 py-5 text-left">Contato Operacional</th>
                         <th className="px-8 py-5 text-left">Status de Acesso</th>
                         <th className="px-8 py-5 text-left">Atividade</th>
                         <th className="px-8 py-5 text-right">Comandos</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {admins.map((admin) => (
                         <tr key={admin.id} className="group hover:bg-white/2 transition-all cursor-default">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-sm text-primary border border-white/5 group-hover:border-primary/30 transition-all shadow-xl">
                                     {admin.name[0]}
                                  </div>
                                  <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{admin.name}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-slate-400 font-medium">{admin.email}</td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Ativo' ? 'bg-primary animate-pulse shadow-[0_0_8px_#20c997]' : 'bg-red-500'}`} />
                                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                     admin.status === 'Ativo' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-red-500/5 text-red-500 border-red-500/20'
                                  }`}>
                                     {admin.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-xs text-slate-500 font-medium tracking-tight">Visto {admin.lastLogin}</td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => handleOpenEdit(admin)} className="p-2.5 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl transition-all text-slate-500 active:scale-90" title="Editar Credenciais">
                                     <Edit3 size={16} />
                                  </button>
                                  <button onClick={() => handleDelete(admin.id, admin.name)} className="p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all text-slate-500 active:scale-90" title="Revogar Acesso">
                                     <Trash2 size={16} />
                                  </button>
                                </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </motion.div>

          {/* Activity Logs */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#080808]/85 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col backdrop-blur-md"
          >
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black uppercase tracking-tight">Logs de <span className="text-primary">Atividade</span></h3>
                <button onClick={() => showToast('Abrindo visualização detalhada de logs.', 'info')} className="p-2 hover:bg-white/5 rounded-lg text-slate-500" title="Ver logs"><Eye size={18}/></button>
             </div>
             
             <div className="flex-1 space-y-6 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log) => (
                   <div key={log.id} className="relative pl-6 border-l border-white/10 group">
                      <div className="absolute left-[-5px] top-1 w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_#20c997]" />
                      <div className="flex items-center justify-between mb-1">
                         <span className="text-[10px] font-black uppercase text-primary tracking-widest">{log.user}</span>
                         <span className="text-[9px] text-slate-600 font-bold">{log.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{log.action}</p>
                   </div>
                ))}
             </div>
             
              <Link href="/super-administrador/logs" className="block w-full">
                <Button variant="outline" className="w-full mt-8 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl">
                  Ver Todos os Logs
                </Button>
              </Link>
          </motion.div>
        </div>

        {/* Geolocation Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[650px] w-full"
        >
           <div className="mb-6 flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-black uppercase tracking-tight">Mapa de <span className="text-primary">Geolocalização</span></h3>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Distribuição geográfica de administradores e ocorrências</p>
              </div>
           </div>
           <ComplaintMap />
        </motion.div>
      </div>

      {/* Modal for Create/Edit Admin */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl"
            >
              <button onClick={handleCloseModal} className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
              <h3 className="text-md font-black uppercase tracking-wider text-primary mb-6">
                {modalMode === 'create' ? 'Adicionar Administrador' : 'Editar Administrador'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" 
                    placeholder="Ex: Matheus Leon" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">E-mail Operacional</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" 
                    placeholder="exemplo@ECOA.br" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Status de Acesso</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                  <button type="button" onClick={handleCloseModal} className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] h-10 px-5 rounded-xl transition-all">Cancelar</button>
                  <button type="submit" className="bg-primary text-black font-black uppercase tracking-widest text-[9px] h-10 px-5 rounded-xl transition-all">Confirmar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend?: string }) {
  return (
    <div className="bg-[#080808]/85 border border-white/5 p-6 rounded-3xl shadow-xl backdrop-blur-md">
       <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/3 rounded-2xl">{icon}</div>
          {trend && (
             <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-full">{trend}</span>
          )}
       </div>
       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
       <h4 className="text-2xl font-black">{value}</h4>
    </div>
  );
}
