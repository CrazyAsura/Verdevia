'use client';

import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import api from '@/services/api';

type UserAccount = {
  id: string;
  realName?: string;
  email: string;
  role: string;
  createdAt: string;
};

type UsersTabProps = {
  token: string;
};

export function UsersTab({ token }: UsersTabProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get<UserAccount[]>('/ai/users');
      setUsers(response.data || []);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/ai/users', {
        name,
        email,
        password,
        role,
      });
      setSuccessMsg(`Usuário administrador "${name}" criado com sucesso!`);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('admin');
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Falha ao criar conta administrativa.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (emailToDelete: string) => {
    if (!confirm(`Remover permanentemente a conta administrador de "${emailToDelete}"?`)) return;

    try {
      await api.delete(`/ai/users/${encodeURIComponent(emailToDelete)}`);
      setUsers((current) => current.filter((u) => u.email !== emailToDelete));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Falha ao remover administrador.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/5">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">Gestão de Administradores</h2>
          <p className="text-[11px] text-zinc-400">Gerenciamento de contas e credenciais autorizadas a operar o painel.</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Atualizar lista"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw size={14} />}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[11px] font-semibold">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-[11px] font-semibold">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-zinc-900/20 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Nova Conta</h3>
            <p className="text-[10px] text-zinc-500">Adicione um novo administrador.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: joao@verdevia.com"
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Senha Provisória</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 14 caracteres..."
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
              />
              <span className="text-[9px] text-zinc-500 block leading-tight">
                Mínimo 14 caracteres, com maiúsculas, minúsculas, números e símbolos.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Perfil de Acesso</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
              >
                <option value="admin">Admin comum</option>
                <option value="super_admin">Super Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Criar Administrador</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div className="lg:col-span-2 bg-zinc-900/20 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Contas Registradas</h3>
            <p className="text-[10px] text-zinc-500">Usuários administrativos que gerenciam a base.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px]">
                  <th className="pb-3 font-semibold">Nome / E-mail</th>
                  <th className="pb-3 font-semibold">Perfil</th>
                  <th className="pb-3 font-semibold">Criação</th>
                  <th className="pb-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.email} className="text-zinc-300 hover:text-white transition-colors">
                    <td className="py-3.5 pr-2">
                      <div className="font-bold text-white leading-snug">{user.realName || 'Nome não preenchido'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono leading-tight">{user.email}</div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        user.role === 'super_admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="py-3.5 text-zinc-500 font-mono text-[10px]">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleDelete(user.email)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remover conta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500 text-xs">
                      {loading ? 'Carregando lista de administradores...' : 'Nenhum administrador encontrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
