'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Loader2, Lock, Mail, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { AppSidebar, Tab } from '@/components/AppSidebar';
import { WorkspaceHeader } from '@/components/WorkspaceHeader';
import { DashboardTab } from '@/components/DashboardTab';
import { DocumentsTab } from '@/components/DocumentsTab';
import { OmnichannelTab } from '@/components/OmnichannelTab';
import { LogsTab } from '@/components/LogsTab';
import { UsersTab } from '@/components/UsersTab';

type UserSession = {
  username: string;
  role: string;
  token: string;
};

export default function AdminPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // App Shell state
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if token already exists in localStorage
    const savedToken = localStorage.getItem('VERDEVIA_token');
    const savedUserStr = localStorage.getItem('VERDEVIA_user');
    if (savedToken && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setSession({
          token: savedToken,
          username: savedUser.username || savedUser.email || '',
          role: savedUser.role || 'admin',
        });
        if (savedUser.role !== 'super_admin') {
          setActiveTab('omni'); // default tab for normal admin is Omnichannel (since other views are super_admin only)
        }
      } catch {
        localStorage.removeItem('VERDEVIA_token');
        localStorage.removeItem('VERDEVIA_user');
      }
    }
    setCheckingSession(false);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await api.post('/ai/admin/login', {
        username: email,
        password: password,
      });

      const { token, role, username } = response.data;
      localStorage.setItem('VERDEVIA_token', token);
      localStorage.setItem('VERDEVIA_user', JSON.stringify({ email: username, username, role }));

      setSession({ token, role, username });
      if (role === 'super_admin') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('omni');
      }
    } catch (err: any) {
      setLoginError(
        err?.response?.data?.message || err.message || 'Falha ao autenticar administrador.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('VERDEVIA_token');
    localStorage.removeItem('VERDEVIA_user');
    setSession(null);
    setEmail('');
    setPassword('');
  };

  if (checkingSession) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  // Render Login view
  if (!session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(24,24,27,0.8),transparent_80%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md bg-zinc-900/35 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg mb-2">
              <Bot className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-white">VERDEVIA ADMIN</h1>
            <p className="text-xs text-zinc-400">Entre na central administrativa do chatbot RAG</p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold">
              <Lock className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Mail size={12} className="text-emerald-400" />
                E-mail Administrativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: admin@verdevia.com"
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Key size={12} className="text-emerald-400" />
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha de admin"
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-11 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loginLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Render Admin Dashboard Shell
  const titleMap: Record<Tab, [string, string]> = {
    dashboard: ['Dashboard de Métricas', 'Métricas consolidadas de uso de RAG e consumo de tokens.'],
    docs: ['Catálogo RAG', 'Indexação vetorial de documentos e controle de permissões.'],
    omni: ['Omnichannel API', 'Barramento de teste e configuração de webhooks de mensagens.'],
    logs: ['Logs do Sistema', 'Auditoria de exceções do servidor em tempo real.'],
    users: ['Gestão de Contas', 'Criação e exclusão de contas administrativas autorizadas.'],
  };

  const [title, subtitle] = titleMap[activeTab];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <AppSidebar
        user={session}
        activeTab={activeTab}
        collapsed={sidebarCollapsed}
        onTabChange={setActiveTab}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-900/10 relative">
        <WorkspaceHeader title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col h-full"
            >
              {activeTab === 'dashboard' && <DashboardTab token={session.token} />}
              {activeTab === 'docs' && <DocumentsTab token={session.token} />}
              {activeTab === 'omni' && <OmnichannelTab token={session.token} />}
              {activeTab === 'logs' && <LogsTab token={session.token} />}
              {activeTab === 'users' && <UsersTab token={session.token} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
