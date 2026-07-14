'use client';

import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, FileText, ShieldCheck, Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getAccessUsers, type ManagedUser } from '@/services/admin-control.service';
import { downloadXlsx, printPdfReport } from '@/lib/admin-report';

const COLORS = ['#20c997', '#ef4444'];

export default function AccessAdministrationPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => { getAccessUsers().then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false)); }, []);
  const active = users.filter((user) => user.status === 'Ativo').length;
  const chartData = [{ name: 'Ativos', value: active }, { name: 'Inativos', value: users.length - active }];
  const filtered = useMemo(() => users.filter((user) => `${user.name} ${user.email} ${user.plan}`.toLowerCase().includes(query.toLowerCase())), [users, query]);
  const exportRows = filtered.map(({ name, email, plan, status, createdAt }) => ({ Nome: name, Email: email, Plano: plan, Status: status, Cadastro: new Date(createdAt).toLocaleDateString('pt-BR') }));
  return <DashboardLayout title="Planos e acessos" role="super-admin"><div className="space-y-6">
    <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6"><p className="text-[10px] font-black uppercase tracking-[.22em] text-primary">Microserviço: identity-access</p><h1 className="mt-2 text-2xl font-black">Gestão de planos, acessos e usuários</h1><p className="mt-2 text-sm text-slate-400">Este painel consome somente o contrato de identidade e assinatura; não depende das operações de IA.</p></section>
    <div className="grid gap-4 md:grid-cols-3"><Metric icon={<Users />} label="Usuários cadastrados" value={users.length} /><Metric icon={<ShieldCheck />} label="Acessos ativos" value={active} /><Metric icon={<ShieldCheck />} label="Acessos inativos" value={users.length - active} /></div>
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="rounded-3xl border border-white/10 bg-card p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Usuários e permissões</h2><p className="text-xs text-slate-500">Status calculado pela atividade dos últimos 30 dias.</p></div><div className="flex gap-2"><button onClick={() => downloadXlsx('usuarios-e-acessos', exportRows)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs"><Download size={14}/> XLSX</button><button onClick={() => printPdfReport('Relatório de planos e acessos', [['Usuários', String(users.length)], ['Ativos', String(active)], ['Inativos', String(users.length - active)]], chartData.map(({ name, value }) => ({ label: name, value })))} className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-black"><FileText size={14}/> PDF</button></div></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nome, e-mail ou plano" className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"/><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="text-left text-[10px] uppercase tracking-widest text-slate-500"><tr><th className="p-3">Usuário</th><th>Plano</th><th>Status</th><th>Cadastro</th></tr></thead><tbody>{loading ? <tr><td className="p-4 text-slate-500" colSpan={4}>Carregando usuários...</td></tr> : filtered.map((user) => <tr key={user.id} className="border-t border-white/5"><td className="p-3"><b>{user.name}</b><small className="ml-2 text-slate-500">{user.email}</small></td><td>{user.plan}</td><td><span className={user.status === 'Ativo' ? 'text-primary' : 'text-red-400'}>{user.status}</span></td><td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div></div><div className="rounded-3xl border border-white/10 bg-card p-5"><h2 className="font-black">Atividade da base</h2><div className="h-56"><ResponsiveContainer><PieChart><Pie data={chartData} dataKey="value" innerRadius={55} outerRadius={80}>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="space-y-2 text-sm">{chartData.map((row, i) => <p key={row.name}><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: COLORS[i] }}/>{row.name}: <b>{row.value}</b></p>)}</div></div></section>
  </div></DashboardLayout>;
}
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="rounded-2xl border border-white/10 bg-card p-5"><div className="mb-3 text-primary">{icon}</div><p className="text-xs text-slate-500">{label}</p><p className="text-3xl font-black">{value}</p></div>; }
