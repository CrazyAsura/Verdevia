'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Plus,
  Flag,
  CheckCircle2,
  Filter,
  Loader2,
  Users,
  Search,
  LayoutDashboard,
  LockKeyhole
} from 'lucide-react';
import StatsService, { DashboardStats } from '@/services/stats.service';
import ComplaintsService, { Complaint } from '@/services/complaints.service';
import CoursesService, { Course } from '@/services/courses.service';
import ForumService from '@/services/forum.service';
import MFEContainer from '@/components/microfrontends/MFEContainer';
import { LockedFeature } from '@/components/plan/LockedFeature';
import { useAuth } from '@/context/AuthContext';
import { hasAnyPlanFeature } from '@/lib/plan-access';

const ComplaintMap = dynamic(() => import('@/components/complaints/ComplaintMap'), { ssr: false });

// ─── Status badge helpers ──────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-slate-800/40 text-slate-400 border-slate-700/50',
  'em análise': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  resolvido: 'bg-primary/5 text-primary border-primary/20',
  rejeitado: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function statusBadge(status: string) {
  return STATUS_COLORS[status?.toLowerCase()] ?? STATUS_COLORS['pendente'];
}

// ─── Subcomponents ────────────────────────────────────────────────────────────
function AdminStatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-[#080808]/80 border border-white/5 p-6 rounded-3xl group hover:border-primary/20 transition-all backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/3 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">
            {label}
          </p>
          {loading ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : (
            <h4 className="text-xl font-black">{value}</h4>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'complaints' | 'forum'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [forumCount, setForumCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const canManageCourses = hasAnyPlanFeature(user, ['courses:manage']);
  const canManageComplaints = hasAnyPlanFeature(user, ['complaints:manage']);
  const canModerateForum = hasAnyPlanFeature(user, ['forum:moderate']);

  // ─── Fetch Stats ─────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const data = await StatsService.getStats();
      setStats(data);
    } catch (e) {
      console.error('[Admin] Failed to load stats:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ─── Fetch Complaints ─────────────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    try {
      const data = await ComplaintsService.getComplaints(1, 5, undefined, 'pendente');
      setComplaints(data.items ?? []);
    } catch (e) {
      console.error('[Admin] Failed to load complaints:', e);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  // ─── Fetch Courses ────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    try {
      const data = await CoursesService.getCourses();
      setCourses(data);
    } catch (e) {
      console.error('[Admin] Failed to load courses:', e);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // ─── Fetch Forum count ────────────────────────────────────────────────────
  const fetchForumCount = useCallback(async () => {
    try {
      const data = await ForumService.getPosts(1, 1);
      setForumCount(data.total ?? 0);
    } catch (e) {
      console.error('[Admin] Failed to load forum count:', e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchComplaints();
    fetchCourses();
    fetchForumCount();
  }, [fetchStats, fetchComplaints, fetchCourses, fetchForumCount]);

  const handleResolveComplaint = async (id: string) => {
    try {
      await ComplaintsService.updateComplaintStatus(id, 'Resolvido');
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error('[Admin] Failed to resolve complaint:', e);
    }
  };

  return (
    <DashboardLayout title="Painel Operacional Admin" role="admin">
      <div className="space-y-8">
        {/* Navigation Tabs for Microfrontends */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard size={14} /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'courses'
                ? 'bg-primary text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : canManageCourses
                  ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                  : 'border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10'
            }`}
          >
            {canManageCourses ? <BookOpen size={14} /> : <LockKeyhole size={14} />} Cursos (MFE)
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'complaints'
                ? 'bg-primary text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : canManageComplaints
                  ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                  : 'border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10'
            }`}
          >
            {canManageComplaints ? <AlertTriangle size={14} /> : <LockKeyhole size={14} />} Queixas (MFE)
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'forum'
                ? 'bg-primary text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : canModerateForum
                  ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                  : 'border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Search size={14} /> Fórum & Alertas (MFE)
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard
                icon={<AlertTriangle className="text-amber-500" />}
                label="Queixas Pendentes"
                value={String(complaints.length)}
                loading={loadingComplaints}
              />
              <AdminStatCard
                icon={<Users className="text-sky-400" />}
                label="Usuários Totais"
                value={String(stats?.totalUsers ?? '--')}
                loading={loadingStats}
              />
              <AdminStatCard
                icon={<BookOpen className="text-blue-500" />}
                label="Cursos Ativos"
                value={String(courses.length)}
                loading={loadingCourses}
              />
              <AdminStatCard
                icon={<MessageSquare className="text-emerald-400" />}
                label="Tópicos Fórum"
                value={String(forumCount)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Quick Complaints Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#080808]/80 border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">
                      Central de <span className="text-primary">Queixas</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Monitoramento e triagem de ocorrências
                    </p>
                  </div>
                  <button
                    onClick={fetchComplaints}
                    className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <Filter size={18} />
                  </button>
                </div>

                {loadingComplaints ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-primary" />
                  </div>
                ) : complaints.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-10">
                    Nenhuma queixa pendente. ✓
                  </p>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 md:p-5 bg-white/1 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/30 hover:bg-white/2 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <Flag size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                              {item.type} — {item.location}
                            </h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                                ID: {item.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <span
                            className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusBadge(item.status)}`}
                          >
                            {item.status}
                          </span>
                          <button
                            onClick={() => handleResolveComplaint(item.id)}
                            className="p-2.5 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl transition-all text-slate-600 active:scale-90"
                            title="Marcar como Resolvido"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Map */}
              <div className="h-[400px] flex flex-col">
                <h3 className="text-lg font-black uppercase tracking-tight mb-6">
                  Mapa de <span className="text-primary">Ocorrências</span>
                </h3>
                <div className="flex-1 rounded-3xl overflow-hidden border border-white/5">
                  <ComplaintMap />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="animate-fadeIn">
            {canManageCourses ? <MFEContainer tagName="courses-mfe" /> : <LockedFeature feature="courses:manage" />}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="animate-fadeIn">
            {canManageComplaints ? <MFEContainer tagName="complaints-mfe" /> : <LockedFeature feature="complaints:manage" />}
          </div>
        )}

        {activeTab === 'forum' && (
          <div className="animate-fadeIn">
            {canModerateForum ? <MFEContainer tagName="forum-search-notification-mfe" /> : <LockedFeature feature="forum:moderate" />}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
