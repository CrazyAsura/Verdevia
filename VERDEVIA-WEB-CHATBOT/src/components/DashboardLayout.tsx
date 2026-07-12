'use client';

import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X,
  BookOpen,
  History,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  FileText,
  LockKeyhole
} from 'lucide-react';
import Link from 'next/link';
import { getEffectivePlan, hasAnyPlanFeature, PlanFeature } from '@/lib/plan-access';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: UserRole;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function CinematicTooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  
  return (
    <div 
      className="relative inline-block max-w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 backdrop-blur-md border border-white/10 text-white text-[10px] rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl shadow-black/40 font-mono tracking-wider uppercase"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-black/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchVal, setSearchVal] = React.useState('');

  React.useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchVal(value);
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login based on intended role if not logged in
        switch (role) {
          case 'super-admin': router.push('/autenticacao/super-administrador/login'); break;
          case 'admin': router.push('/autenticacao/administrador/login'); break;
          case 'contractor': router.push('/autenticacao/prestadores/login'); break;
          case 'super-contractor': router.push('/autenticacao/super-prestadores/login'); break;
          default: router.push('/');
        }
      } else {
        const normalizedUserRole = user.role?.replace(/_/g, '-').toLowerCase();
        const normalizedRequiredRole = role?.replace(/_/g, '-').toLowerCase();
        if (normalizedUserRole !== normalizedRequiredRole) {
          // Unauthorized role for this section
          router.push('/');
        }
      }
    }
  }, [user, isLoading, role, router]);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Auto-close sidebar on small screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const normalizedUserRole = user?.role?.replace(/_/g, '-').toLowerCase();
  const normalizedRequiredRole = role?.replace(/_/g, '-').toLowerCase();

  if (isLoading || !user || normalizedUserRole !== normalizedRequiredRole) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Verificando Acesso...</p>
        </div>
      </div>
    );
  }

  type SidebarConfigItem = {
    icon: React.ReactNode;
    label: string;
    href: string;
    features?: PlanFeature[];
    lockedMode?: 'show' | 'hide';
  };

  const roleConfigs: Record<string, { items: SidebarConfigItem[] }> = {
    'super-admin': {
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Visão Geral', href: '/super-administrador' },
        { icon: <Users size={20} />, label: 'Administradores', href: '/super-administrador/administradores' },
        { icon: <History size={20} />, label: 'Logs do Sistema', href: '/super-administrador/logs', features: ['stats:audit'], lockedMode: 'show' },
        { icon: <FileText size={20} />, label: 'Documentos LGPD', href: '/super-administrador/conformidade' },
      ]
    },

    'admin': {
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Painel', href: '/administrador' },
        { icon: <BookOpen size={20} />, label: 'Cursos', href: '/administrador/cursos', features: ['courses:manage'], lockedMode: 'show' },
        { icon: <AlertTriangle size={20} />, label: 'Queixas', href: '/administrador/denuncias', features: ['complaints:manage'], lockedMode: 'show' },
        { icon: <MessageSquare size={20} />, label: 'Fórum', href: '/administrador/forum', features: ['forum:moderate'], lockedMode: 'show' },
      ]
    },
    'contractor': {
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Visão Geral', href: '/prestadores' },
        { icon: <ClipboardList size={20} />, label: 'Minhas Missões', href: '/prestadores/denuncias', features: ['complaints:manage'], lockedMode: 'show' },
      ]
    },
    'super-contractor': {
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Visão Geral', href: '/super-prestadores' },
        { icon: <AlertTriangle size={20} />, label: 'Alertas SLA', href: '/super-prestadores/subordinados', features: ['contractors:manage'], lockedMode: 'show' },
      ]
    },
  };

  // Sync underscore aliases with their hyphenated counterparts
  roleConfigs['super_admin'] = roleConfigs['super-admin'];
  roleConfigs['super_contractor'] = roleConfigs['super-contractor'];

  return (
    <div className="admin-shell h-dvh min-h-screen bg-background text-foreground flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : 80,
          x: (typeof window !== 'undefined' && window.innerWidth < 1024 && !isSidebarOpen) ? -80 : 0
        }}
        className="bg-card/95 border-r border-border flex flex-col z-60 fixed lg:relative h-dvh max-w-[86vw] transition-all duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-black uppercase tracking-[0.3em] text-primary text-xs"
            >
              VERDEVIA Panel
            </motion.span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white active:scale-95"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
            {roleConfigs[role as keyof typeof roleConfigs]?.items.map((item, idx) => {
              const locked = item.features ? !hasAnyPlanFeature(user, item.features) : false;
              if (locked && item.lockedMode === 'hide') return null;

              return (
                <SidebarItem key={idx} {...item} isOpen={isSidebarOpen} locked={locked} />
              );
            })}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button 
             onClick={logout}
             className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
           >
             <LogOut size={20} />
             {isSidebarOpen && <span>Sair do Sistema</span>}
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="min-h-20 bg-background/80 backdrop-blur-md border-b border-border flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex-nowrap md:px-8 z-40">
           <div className="min-w-0 flex flex-1 items-center gap-3 sm:gap-4">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Menu size={20} />
                </button>
              )}
              <CinematicTooltip content={title}>
                <h1 className="text-sm md:text-xl font-black uppercase tracking-tight truncate max-w-[42vw] sm:max-w-[240px] xl:max-w-none">{title}</h1>
              </CinematicTooltip>
              <div className="hidden sm:block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                 <span className="text-[10px] font-black uppercase text-primary tracking-widest">{role}</span>
              </div>
              <div className="hidden lg:block px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   Plano {getEffectivePlan(user).replace('_', ' ')}
                 </span>
              </div>
           </div>

           <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-6">
              <ThemeToggle className="hidden md:inline-flex size-10" />
              <div className="relative hidden lg:block">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="Pesquisar no sistema..." 
                   value={searchVal}
                   onChange={(e) => handleSearch(e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-full h-10 pl-12 pr-6 text-xs focus:ring-1 focus:ring-primary focus:border-primary transition-all w-64"
                 />
              </div>
              <button
                onClick={() => setShowNotifications((current) => !current)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
                title="Notificações"
              >
                 <Bell size={20} />
                 <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-4 top-18 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#080808] p-4 shadow-2xl shadow-black/40"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Central de Notificações</p>
                    <div className="mt-4 space-y-3">
                      {['Nova atualização de conformidade disponível', 'Verificação de segurança concluída', 'Resumo operacional pronto para revisão'].map((message) => (
                        <div key={message} className="rounded-xl border border-white/5 bg-white/3 p-3">
                          <p className="text-xs font-bold text-slate-200">{message}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-6">
                 <div className="hidden text-right sm:block">
                    <p className="text-xs font-black uppercase tracking-tight">{user?.name || 'Administrador'}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {user?.id?.slice(0, 5) || '---'}</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary">
                    {user?.name?.[0] || 'A'}
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
           {children}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  href = "#",
  active = false,
  isOpen,
  locked = false,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  isOpen: boolean;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <Link href="/planos" className="group flex items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 transition-all hover:bg-red-500/10">
        <div className="relative shrink-0">
          {icon}
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white">
            <LockKeyhole size={10} />
          </span>
        </div>
        {isOpen && (
          <span className="min-w-0 text-sm font-bold">
            {label}
            <span className="mt-0.5 block text-[8px] font-black uppercase tracking-widest text-red-300">
              Invista em plano melhor
            </span>
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link href={href} className={`
      flex items-center gap-4 p-4 rounded-xl transition-all group
      ${active ? 'bg-primary text-black' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
    `}>
      <div className={`${active ? 'text-black' : 'group-hover:scale-110 transition-transform'}`}>
        {icon}
      </div>
      {isOpen && <span className="text-sm font-bold">{label}</span>}
    </Link>
  );
}
