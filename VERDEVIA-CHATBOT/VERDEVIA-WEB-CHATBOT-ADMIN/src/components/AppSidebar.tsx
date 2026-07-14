'use client';

import React from 'react';
import {
  BarChart3,
  FileText,
  LogOut,
  Menu,
  Unplug,
  UserCog,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'dashboard' | 'docs' | 'omni' | 'logs' | 'users';

type AppSidebarProps = {
  user: { username: string; role: string };
  activeTab: Tab;
  collapsed: boolean;
  onTabChange: (tab: Tab) => void;
  onToggleCollapse: () => void;
  onLogout: () => void;
};

export function AppSidebar({
  user,
  activeTab,
  collapsed,
  onTabChange,
  onToggleCollapse,
  onLogout,
}: AppSidebarProps) {
  const isSuperAdmin = user.role === 'super_admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, adminOnly: true },
    { id: 'docs', label: 'Documentos RAG', icon: FileText, adminOnly: true },
    { id: 'omni', label: 'Omnichannel API', icon: Unplug, adminOnly: false },
    { id: 'users', label: 'Usuários', icon: UserCog, adminOnly: true },
    { id: 'logs', label: 'Logs do Sistema', icon: Settings, adminOnly: true },
  ] as const;

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-white/5 bg-zinc-950 text-zinc-100 transition-all duration-300 shadow-2xl h-screen shrink-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header / Brand */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black">
              E
            </div>
            <div>
              <strong className="block text-sm font-black tracking-wider text-white">VERDEVIA ADMIN</strong>
              <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Painel Chatbot</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black">
            E
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <span className="block px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
            Módulos
          </span>
        )}
        {menuItems.map((item) => {
          if (item.adminOnly && !isSuperAdmin) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as Tab)}
              className={cn(
                'flex items-center w-full rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 group relative',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100 border border-transparent',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 rounded bg-zinc-900 border border-white/10 text-[10px] text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-zinc-900/10 flex flex-col gap-3">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <strong className="block text-xs font-bold text-zinc-200 truncate" title={user.username}>
                {user.username}
              </strong>
              <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-400">
                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg border border-white/5 bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all text-[11px] font-bold"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="mx-auto p-2 rounded-xl border border-white/5 bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
