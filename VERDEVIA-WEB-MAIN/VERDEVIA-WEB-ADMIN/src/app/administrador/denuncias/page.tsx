'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MFEContainer from '@/components/microfrontends/MFEContainer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LockedFeature } from '@/components/plan/LockedFeature';
import { useAuth } from '@/context/AuthContext';
import { hasAnyPlanFeature } from '@/lib/plan-access';

export default function AdminComplaintsPage() {
  const { user } = useAuth();
  const canManageComplaints = hasAnyPlanFeature(user, ['complaints:manage']);

  return (
    <DashboardLayout title="Central de Queixas" role="admin">
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Link href="/administrador" className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Central de <span className="text-primary text-glow">Queixas</span></h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestão de denúncias e mediação com empresas parceiras</p>
          </div>
        </header>

        <div className="animate-fadeIn">
          {canManageComplaints ? (
            <MFEContainer tagName="complaints-mfe" />
          ) : (
            <LockedFeature feature="complaints:manage" />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
