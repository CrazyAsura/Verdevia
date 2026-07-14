'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Loader2,
  RefreshCw,
  AlertTriangle,
  User,
  Monitor,
  Globe,
  Terminal,
  Search,
} from 'lucide-react';
import api from '@/services/api';

type ErrorLog = {
  id: string;
  error: string;
  ip: string;
  browser: string;
  username: string;
  action: string;
  route: string;
  timestamp: string;
};

type LogsTabProps = {
  token: string;
};

export function LogsTab({ token }: LogsTabProps) {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get<ErrorLog[]>('/ai/logs');
      // Sort logs by timestamp descending
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLogs(sorted);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Erro ao carregar logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [token]);

  const filteredLogs = logs.filter(
    (log) =>
      log.error?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.route?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/5">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">Auditoria de Logs</h2>
          <p className="text-[11px] text-zinc-400">Histórico de erros e exceções capturados no servidor microserviço NestJS.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Filtrar por erro, rota, usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 text-xs text-white placeholder-zinc-500 h-9 rounded-xl pl-9 pr-4 outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Atualizar logs"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw size={14} />}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[11px] font-semibold">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Logs Catalog */}
      {loading && logs.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-emerald-400 mb-2" size={28} />
          <p className="text-xs text-zinc-500">Lendo logs do servidor...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-zinc-900/15 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4 hover:border-white/10 transition-colors"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                    {log.action}
                  </span>
                  <span className="text-xs font-mono font-bold text-white/95 truncate max-w-[300px]" title={log.route}>
                    {log.route}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-emerald-400" />
                  <span>Usuário: <strong className="text-zinc-200">{log.username}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={14} className="text-emerald-400" />
                  <span>IP: <strong className="text-zinc-200">{log.ip}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor size={14} className="text-emerald-400" />
                  <span className="truncate" title={log.browser}>
                    Browser: <strong className="text-zinc-200">{log.browser.substring(0, 30)}...</strong>
                  </span>
                </div>
              </div>

              {/* Stack Trace Terminal Box */}
              <div className="bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-red-400 leading-relaxed overflow-x-auto space-y-1 max-h-56 shadow-inner">
                <div className="flex items-center gap-1 text-[9px] font-black text-red-500/80 uppercase tracking-widest mb-2 select-none border-b border-white/5 pb-1">
                  <Terminal size={12} />
                  <span>Stack Trace / Detalhes do Erro</span>
                </div>
                <pre className="whitespace-pre-wrap select-all font-mono">{log.error}</pre>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="bg-zinc-900/10 border border-white/5 rounded-2xl p-12 text-center text-zinc-500 text-xs">
              Nenhum log de erro capturado correspondente aos filtros.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
