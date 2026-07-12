'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MFEContainer from '@/components/microfrontends/MFEContainer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminForumPage() {
  return (
    <DashboardLayout title="Moderação de Fórum & Notificações" role="admin">
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Link href="/administrador" className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Fórum & <span className="text-primary text-glow">Alertas</span></h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Busque tópicos de discussão e acompanhe notificações operacionais</p>
          </div>
        </header>

        <div className="animate-fadeIn">
          <MFEContainer tagName="forum-search-notification-mfe" />
        </div>
      </div>
    </DashboardLayout>
  );
}
