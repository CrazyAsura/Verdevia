'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { useStats } from '@/hooks/useStats';
import { 
  Users, 
  ShieldAlert, 
  BarChart3, 
  Globe, 
  ArrowUpRight, 
  Download, 
  FileSpreadsheet, 
  FileText,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiBaseUrl } from '@/services/api';
import StatsService from '@/services/stats.service';
import { io } from 'socket.io-client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

import { DownloadPDFButton } from '@/components/PDFReport';

// Dynamic import for Leaflet map to prevent Next.js SSR window error
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-87.5 bg-white/2 rounded-3xl border border-white/5 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  )
});

interface RecentComplaint {
  id: string;
  title?: string;
  description?: string;
  status: string;
  type?: string;
  createdAt?: string;
}

const getRealtimeBaseUrl = () => getApiBaseUrl().replace(/\/api$/, '');

export default function DashboardPage() {
  const { data: realStats, isLoading } = useStats();
  const totalUsers = realStats?.totalUsers ?? 0;
  const totalComplaints = realStats?.totalComplaints ?? 0;
  const [sparkPredictions, setSparkPredictions] = useState<any[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string; filename?: string } | null>(null);

  // WebSocket Connection for BullMQ feedback
  useEffect(() => {
    // Get token and userId from localStorage
    const storedAuth = localStorage.getItem('auth-storage');
    let userId = '';
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        userId = parsed?.state?.user?.id || '';
      } catch (e) {
        console.error(e);
      }
    }

    if (!userId) return;

    const socketHost = getRealtimeBaseUrl();
    const socket = io(socketHost, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to notification WebSocket');
      socket.emit('join_room', userId);
    });

    socket.on('notification', (payload: any) => {
      if (payload.type === 'EXPORT_COMPLETED') {
        setNotification({
          title: payload.title,
          message: payload.message,
          filename: payload.filename
        });
        setExportLoading(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Spark Predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await StatsService.getSparkPredictions();
        setSparkPredictions(data || []);
      } catch (e) {
        console.error(`Failed to fetch predictions: ${e}`);
      }
    };
    fetchPredictions();
  }, []);

  // Trigger Excel Export via Queue
  const handleExcelExport = async () => {
    try {
      setExportLoading(true);
      setNotification(null);
      await StatsService.requestExcelExport();
    } catch (e) {
      console.error(e);
      setExportLoading(false);
    }
  };

  const handleDownloadFile = () => {
    if (!notification?.filename) return;
    StatsService.getExportFile(notification.filename)
      .then((file) => {
        const byteCharacters = atob(file.base64);
        const byteNumbers = Array.from(byteCharacters, (char) =>
          char.charCodeAt(0),
        );
        const blob = new Blob([new Uint8Array(byteNumbers)], {
          type: file.mimeType,
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.filename;
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch((error) => console.error(error));
    setNotification(null);
  };

  // Prepare Recharts Categories Data
  const categoriesData = React.useMemo(() => {
    if (!realStats?.recentComplaints) return [];
    const counts: Record<string, number> = {};
    realStats.recentComplaints.forEach((c: RecentComplaint) => {
      const type = c.type || 'URBANO';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      quantidade: counts[key]
    }));
  }, [realStats]);

  // Prepare Recharts Line Data (Trend)
  const trendData = [
    { name: 'Jan', queixas: 12 },
    { name: 'Fev', queixas: 19 },
    { name: 'Mar', queixas: 15 },
    { name: 'Abr', queixas: 22 },
    { name: 'Mai', queixas: 30 },
    { name: 'Jun', queixas: realStats?.totalComplaints || 35 },
  ];

  // Prepare Recharts Scatter Data (Spark predictions clusters)
  const scatterData = sparkPredictions.map((p) => ({
    x: p.longitude,
    y: p.latitude,
    z: 10,
    cluster: `Cluster ${p.clusterId}`
  }));

  return (
    <main className="min-h-screen bg-background pt-24 pb-12 px-6">
      <Header />
      
      <div className="container mx-auto">
        {/* Toast Notification for WebSocket export completion */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 right-6 z-50 max-w-sm glass border-primary/20 p-6 rounded-2xl shadow-[0_0_30px_rgba(32,201,151,0.2)]"
            >
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-black uppercase tracking-tight text-white mb-1">{notification.title}</h4>
                  <p className="text-[11px] text-muted-foreground mb-4">{notification.message}</p>
                  <button 
                    onClick={handleDownloadFile}
                    className="px-4 py-2 bg-primary text-black font-black uppercase tracking-wider text-[10px] rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    Baixar Planilha
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Painel de <span className="text-primary text-glow">Controle</span></h1>
            <p className="text-muted-foreground uppercase tracking-[0.3em] text-xs font-bold">Métricas analíticas do ecossistema VERDEVIA</p>
          </div>

          {/* Export Actions (Apple Glassmorphism style) */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/5 p-2 rounded-2xl">
            <button
              onClick={handleExcelExport}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {exportLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              Exportar Excel (Fila)
            </button>

            {realStats && (
              <DownloadPDFButton stats={realStats}>
                <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  Exportar PDF (Local)
                </button>
              </DownloadPDFButton>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass border-white/5 p-6">
                 {isLoading ? (
                   <div className="space-y-4">
                      <div className="flex justify-between">
                         <Skeleton className="w-10 h-10 rounded-lg" />
                         <Skeleton className="w-16 h-4" />
                      </div>
                      <Skeleton className="w-24 h-4 opacity-50" />
                      <Skeleton className="w-full h-8" />
                   </div>
                 ) : (
                   <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {i === 0 && <Users className="w-5 h-5 text-primary" />}
                        {i === 1 && <ShieldAlert className="w-5 h-5 text-primary" />}
                        {i === 2 && <BarChart3 className="w-5 h-5 text-primary" />}
                        {i === 3 && <Globe className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex items-center text-xs font-black text-green-500">
                        {i === 0 ? '+12%' : i === 1 ? '+5%' : i === 2 ? '+18%' : '+8%'} <ArrowUpRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                    <h3 className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">
                       {i === 0 ? 'Total de Usuários' : i === 1 ? 'Denúncias Reais' : i === 2 ? 'Cidadãos Ativos' : 'Impacto Global'}
                    </h3>
                    <p className="text-3xl font-black">
                       {i === 0 ? totalUsers : i === 1 ? totalComplaints : i === 2 ? Math.floor(totalUsers * 0.8) : (totalComplaints * 1.5).toFixed(0)}
                    </p>
                   </>
                 )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Spatial Analytics (Spark Maps & predictions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2 glass border-white/5 p-6 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Mapa de Análise Espacial</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Clusters de queixas processados pelo Apache Spark</p>
            </div>
            <DashboardMap />
          </Card>
          
          <Card className="glass border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Telemetria de Atividades</h3>
            <div className="space-y-6">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4">
                     <Skeleton className="w-2 h-8 rounded-full" />
                     <div className="space-y-2 flex-1">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-1/2 h-3 opacity-50" />
                     </div>
                  </div>
                ))
              ) : realStats?.recentComplaints?.map((complaint: RecentComplaint, i: number) => (
                <div key={complaint.id || i} className="flex gap-4 items-start border-l-2 border-primary/20 pl-4 py-1 hover:border-primary transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1 shadow-[0_0_8px_#20c997]" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-tight line-clamp-1">{complaint.title || 'Nova Denúncia'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase opacity-60">Status: {complaint.status || 'Pendente'}</p>
                  </div>
                </div>
              ))}
              {(!realStats?.recentComplaints || realStats.recentComplaints.length === 0) && !isLoading && (
                <p className="text-[10px] text-muted-foreground uppercase">Nenhuma atividade recente</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recharts Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Volume por Categoria</h3>
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                  <Bar dataKey="quantidade" fill="#20C997" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Tendência Temporal de Ocorrências</h3>
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="queixas" stroke="#20C997" strokeWidth={2.5} dot={{ fill: '#20C997', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Dispersão de Clusters (Spark ML)</h3>
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis type="number" dataKey="x" name="Longitude" stroke="#64748b" fontSize={9} domain={['auto', 'auto']} />
                  <YAxis type="number" dataKey="y" name="Latitude" stroke="#64748b" fontSize={9} domain={['auto', 'auto']} />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                  <Scatter name="Anomalias" data={scatterData} fill="#f43f5e" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
