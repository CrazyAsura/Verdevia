'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCcw, 
  Clock, 
  Shield, 
  User as UserIcon, 
  Globe,
  Terminal,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsService from '@/services/stats.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LockedFeature } from '@/components/plan/LockedFeature';
import { useAuth } from '@/context/AuthContext';
import { hasAnyPlanFeature } from '@/lib/plan-access';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuditLog {
  id: string;
  action: string;
  route: string;
  ip: string;
  userName: string;
  userId: string;
  userAgent: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

const formatTimeSafe = (dateStr: any) => {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '---' : format(d, 'HH:mm:ss');
};

const formatDateSafe = (dateStr: any) => {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '---' : format(d, "dd 'de' MMM, yyyy", { locale: ptBR });
};

export default function AuditLogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'activities' | 'errors'>('activities');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const canReadAudit = hasAnyPlanFeature(user, ['stats:audit']);

  React.useEffect(() => {
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', page, activeTab],
    queryFn: () =>
      StatsService.getAuditLogs(page, 20, activeTab) as Promise<{
        logs: AuditLog[];
        total: number;
      }>,
    enabled: canReadAudit,
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const loading = isLoading;
  const fetchLogs = refetch;

  const filteredLogs = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return logs;
    return logs.filter((log) => {
      if (activeTab === 'activities') {
        return (
          log.action?.toLowerCase().includes(normalized) ||
          log.userName?.toLowerCase().includes(normalized) ||
          log.route?.toLowerCase().includes(normalized)
        );
      } else {
        const detailsMessage = String(log.details?.message || '');
        return (
          detailsMessage.toLowerCase().includes(normalized) ||
          log.route?.toLowerCase().includes(normalized) ||
          log.userName?.toLowerCase().includes(normalized)
        );
      }
    });
  }, [logs, query, activeTab]);

  return (
    <DashboardLayout title="Auditoria de Segurança" role="super-admin">
      <div className="space-y-8">
        {!canReadAudit && <LockedFeature feature="stats:audit" />}
        {canReadAudit && (
        <>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              {activeTab === 'activities' ? (
                <>
                  <Terminal className="text-primary text-glow" size={28} />
                  Logs de <span className="text-primary text-glow">Atividade</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="text-red-500 text-glow" size={28} />
                  Logs de <span className="text-red-500 text-glow">Erro</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              {activeTab === 'activities' 
                ? 'Rastreamento em tempo real de todas as ações na plataforma' 
                : 'Monitoramento em tempo real de todas as exceções e falhas do sistema'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => fetchLogs()}
              className="border-white/10 hover:bg-white/5 h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[10px]"
            >
              <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 gap-6">
          <button
            onClick={() => { setActiveTab('activities'); setPage(1); }}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'activities' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Atividades
            {activeTab === 'activities' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('errors'); setPage(1); }}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'errors' ? 'text-red-500 text-glow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Erros do Sistema
            {activeTab === 'errors' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
        </div>

        {/* Filter Bar Simulation */}
        <div className="bg-[#080808] border border-white/5 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={activeTab === 'activities' ? "BUSCAR POR USUÁRIO OU AÇÃO..." : "BUSCAR POR ERRO OU ENDPOINT..."}
              className="w-full bg-white/2 border border-white/5 rounded-xl h-11 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <Button variant="outline" className="border-white/5 bg-white/2 h-11 px-4 rounded-xl text-slate-400">
            <Filter size={16} />
          </Button>
        </div>

        {/* Logs Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/2 text-[10px] uppercase font-black tracking-widest text-slate-500">
                {activeTab === 'activities' ? (
                  <tr>
                    <th className="px-8 py-5 text-left">Timestamp</th>
                    <th className="px-8 py-5 text-left">Usuário</th>
                    <th className="px-8 py-5 text-left">Ação / Rota</th>
                    <th className="px-8 py-5 text-left">Origem (IP)</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-8 py-5 text-left w-12"></th>
                    <th className="px-8 py-5 text-left">Timestamp</th>
                    <th className="px-8 py-5 text-left">Responsável</th>
                    <th className="px-8 py-5 text-left">Erro / Mensagem</th>
                    <th className="px-8 py-5 text-left">Rota / Endpoint</th>
                    <th className="px-8 py-5 text-left">Trace ID</th>
                    <th className="px-8 py-5 text-right">Código</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'activities' ? 5 : 7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Activity className="text-primary animate-pulse" size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acessando banco de dados seguro...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'activities' ? 5 : 7} className="px-8 py-20 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nenhum log encontrado neste filtro.</span>
                    </td>
                  </tr>
                ) : filteredLogs.map((log) => {
                  if (activeTab === 'activities') {
                    return (
                      <tr key={log.id} className="group hover:bg-white/1 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-white font-bold text-xs">
                              <Clock size={12} className="text-slate-500" />
                              {formatTimeSafe(log.createdAt)}
                            </div>
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">
                              {formatDateSafe(log.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <UserIcon size={14} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight text-white">{log.userName || 'Sistema'}</p>
                              <p className="text-[9px] font-bold text-slate-500 font-mono tracking-tighter">{log.userId?.split('-')[0] || '---'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md">
                              {log.action}
                            </span>
                            <p className="text-xs text-slate-400 font-medium mt-1 truncate max-w-[200px]">{log.route}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Globe size={12} className="text-slate-500" />
                            <span className="text-xs font-mono text-slate-400">{log.ip}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                             <Shield size={10} /> Auditado
                           </span>
                        </td>
                      </tr>
                    );
                  } else {
                    const isExpanded = expandedLogId === log.id;
                    const details = log.details || {};
                    const errorMessage = String(details.message || 'Erro interno do servidor');
                    const errorStatus = Number(details.status || 500);
                    const errorStack = String(details.stack || '');
                    const traceId = String(details.traceId || 'N/A');

                    const isSystem = log.userName === 'SystemException' || !log.userId;

                    return (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className={`group hover:bg-white/2 transition-colors cursor-pointer ${isExpanded ? 'bg-white/2' : ''}`}
                        >
                          <td className="px-8 py-6 text-slate-500 group-hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-white font-bold text-xs">
                                <Clock size={12} className="text-slate-500" />
                                {formatTimeSafe(log.createdAt)}
                              </div>
                              <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">
                                {formatDateSafe(log.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                {isSystem ? <Cpu size={14} className="text-red-500" /> : <UserIcon size={14} className="text-red-500" />}
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight text-white">
                                  {isSystem ? 'SISTEMA' : (log.userName || 'Usuario')}
                                </p>
                                <p className="text-[9px] font-bold text-slate-500 font-mono tracking-tighter">
                                  {isSystem ? 'KERNEL' : (log.userId?.split('-')[0] || '---')}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="max-w-[250px] truncate">
                              <p className="text-xs text-red-400 font-black uppercase tracking-tight leading-relaxed">{errorMessage}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-mono text-slate-400">{log.route}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-mono text-slate-500">{traceId.slice(0, 8)}...</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                               errorStatus >= 500 
                                 ? 'bg-red-500/10 text-red-500 border-red-500/20 text-glow' 
                                 : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                             }`}>
                               {errorStatus}
                             </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="bg-black/50 border-y border-white/5 px-8 py-6">
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                              >
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                                  <span>Rastreamento de Pilha Completo (Stack Trace)</span>
                                  <span className="font-mono text-slate-600">ID: {traceId}</span>
                                </div>
                                <div className="bg-[#030303] border border-white/5 rounded-xl p-5 overflow-x-auto max-h-[300px] overflow-y-auto">
                                  <pre className="font-mono text-[10px] text-red-400/80 leading-relaxed whitespace-pre select-all">
                                    {errorStack || `${errorMessage}\n  No stack trace available.`}
                                  </pre>
                                </div>
                                <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono">
                                  <div>IP: {log.ip}</div>
                                  <div>Agent: {log.userAgent}</div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-8 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Mostrando {filteredLogs.length} de {total} registros
            </span>
            <div className="flex items-center gap-2">
              <Button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                variant="outline" 
                className="border-white/10 hover:bg-white/5 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Anterior
              </Button>
              <Button 
                disabled={filteredLogs.length < 20}
                onClick={() => setPage(p => p + 1)}
                variant="outline" 
                className="border-white/10 hover:bg-white/5 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Próximo
              </Button>
            </div>
          </div>
        </motion.div>
        </>
        )}
      </div>
    </DashboardLayout>
  );
}
