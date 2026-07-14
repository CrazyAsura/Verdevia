'use client';

import React, { useEffect, useState } from 'react';
import {
  Coins,
  TrendingUp,
  Users,
  Download,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '@/services/api';

type UsageMetricsSummary = {
  totalTokens: number;
  totalMessages: number;
  activeUsers: number;
  currentMonthTokens: number;
  currentYearTokens: number;
  users: Array<{
    username: string;
    role: string;
    messages: number;
    totalTokens: number;
    currentMonthTokens: number;
    currentYearTokens: number;
  }>;
  monthlyUsage: Array<{
    month: string;
    totalTokens: number;
    messages: number;
    users: number;
  }>;
};

type DashboardTabProps = {
  token: string;
};

export function DashboardTab({ token }: DashboardTabProps) {
  const [metrics, setMetrics] = useState<UsageMetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UsageMetricsSummary>('/ai/metrics');
      setMetrics(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao carregar métricas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  const handleExportPDF = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/ai/metrics/report.pdf', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-verdevia-metrics-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Falha ao baixar o relatório PDF de métricas.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-emerald-400 mb-3" size={36} />
        <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">Carregando Métricas RAG...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-3">
          <AlertTriangle size={24} />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Falha ao obter dados</h4>
        <p className="text-xs text-zinc-400 max-w-md mb-4">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 text-xs font-bold bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 text-white transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  const estimatedCost = (metrics.totalTokens / 1000) * 0.01;

  // Format monthly usage labels
  const monthlyData = metrics.monthlyUsage.map((item) => {
    const [year, month] = item.month.split('-');
    return {
      name: month && year ? `${month}/${year.slice(-2)}` : item.month,
      Tokens: item.totalTokens,
      Mensagens: item.messages,
      Custo: Number(((item.totalTokens / 1000) * 0.01).toFixed(4)),
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/5">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">Monitoramento em Tempo Real</h2>
          <p className="text-[11px] text-zinc-400">Consumo de tokens, requisições de RAG e contabilidade financeira.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={downloading}
          className="flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-xs font-bold text-black transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50 shadow-lg cursor-pointer gap-2"
        >
          {downloading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Gerando PDF...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Exportar PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 flex items-start gap-4 shadow-xl backdrop-blur-md">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Coins size={20} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
              Tokens Utilizados
            </span>
            <h3 className="text-xl font-black text-white leading-none">
              {metrics.totalTokens.toLocaleString('pt-BR')}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              Mês atual: <strong className="text-zinc-200">{metrics.currentMonthTokens.toLocaleString('pt-BR')}</strong>
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 flex items-start gap-4 shadow-xl backdrop-blur-md">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={20} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
              Requisições RAG
            </span>
            <h3 className="text-xl font-black text-white leading-none">
              {metrics.totalMessages.toLocaleString('pt-BR')}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              Custo estimado: <strong className="text-emerald-400">{estimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 flex items-start gap-4 shadow-xl backdrop-blur-md">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users size={20} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
              Administradores Ativos
            </span>
            <h3 className="text-xl font-black text-white leading-none">
              {metrics.activeUsers}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              Média de uso: <strong className="text-zinc-200">{(metrics.totalMessages / Math.max(metrics.activeUsers, 1)).toFixed(1)} reqs/admin</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Charts & Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Usage History Chart */}
        <div className="lg:col-span-2 bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Consumo Mensal de Tokens</h3>
            <p className="text-[10px] text-zinc-500">Histórico de tokens processados pelo gateway RAG.</p>
          </div>
          <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#09090b',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#10b981', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="Tokens" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                Sem dados de histórico disponíveis
              </div>
            )}
          </div>
        </div>

        {/* User usage rankings */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Principais Consumidores</h3>
            <p className="text-[10px] text-zinc-500">Classificação dos administradores por volume de tokens.</p>
          </div>
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {metrics.users.slice(0, 5).map((user, index) => {
              const maxTokens = Math.max(...metrics.users.map((u) => u.totalTokens), 1);
              const percent = (user.totalTokens / maxTokens) * 100;
              return (
                <div key={user.username} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-zinc-300 truncate max-w-[150px]">{user.username}</span>
                    <span className="text-emerald-400 font-mono">{user.totalTokens.toLocaleString('pt-BR')} tkn</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>{user.messages} mensagens</span>
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>
              );
            })}
            {metrics.users.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 py-10">
                Nenhum usuário registrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Users Table */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 shadow-xl">
        <div className="pb-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Listagem Completa de Consumo</h3>
          <p className="text-[10px] text-zinc-500">Visão detalhada por conta e consumo mensal.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px]">
                <th className="pb-3 font-semibold">Conta</th>
                <th className="pb-3 font-semibold">Perfil</th>
                <th className="pb-3 font-semibold text-right">Mensagens</th>
                <th className="pb-3 font-semibold text-right">Mês Atual</th>
                <th className="pb-3 font-semibold text-right">Total Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {metrics.users.map((user) => (
                <tr key={user.username} className="text-zinc-300 hover:text-white transition-colors">
                  <td className="py-3 font-medium text-white truncate max-w-[200px]" title={user.username}>
                    {user.username}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      user.role === 'super_admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-zinc-100">{user.messages}</td>
                  <td className="py-3 text-right font-mono text-zinc-400">{user.currentMonthTokens.toLocaleString('pt-BR')}</td>
                  <td className="py-3 text-right font-mono font-black text-emerald-400">{user.totalTokens.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
              {metrics.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                    Nenhum administrador ativo registrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
