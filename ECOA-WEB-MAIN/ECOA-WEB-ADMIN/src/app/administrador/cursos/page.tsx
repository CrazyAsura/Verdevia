'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/complaints/ComplaintMap'), { ssr: false });
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  ArrowLeft,
  Calendar,
  Users,
  Eye,
  Trash2,
  Edit3,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { encryptParam } from '@/lib/crypto';
import { LockedFeature } from '@/components/plan/LockedFeature';
import { useAuth } from '@/context/AuthContext';
import { hasAnyPlanFeature } from '@/lib/plan-access';
import { useRouter, useSearchParams } from 'next/navigation';
import { showToast } from '@/lib/toast';
import CoursesService, { Course as ApiCourse } from '@/services/courses.service';

interface Course {
  id: string;
  title: string;
  category: string;
  students: number;
  date: string;
  status: string;
}

const toCourseCard = (course: ApiCourse): Course => ({
  id: course.id,
  title: course.title,
  category: course.category || 'Sem categoria',
  students: course.studentsCount ?? 0,
  date: course.createdAt ? new Date(course.createdAt).toLocaleDateString('pt-BR') : 'Sem data',
  status: course.level || 'Iniciante',
});

export default function CoursesManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const canManageCourses = hasAnyPlanFeature(user, ['courses:manage']);

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await CoursesService.getCourses();
        setCourses(data.map(toCourseCard));
        setLoading(false);
      } catch {
        showToast('Não foi possível carregar cursos.', 'error');
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Deseja remover este curso?')) {
      try {
        await CoursesService.deleteCourse(id);
        setCourses((current) => current.filter(c => c.id !== id));
        showToast('Curso removido.', 'success');
      } catch {
        showToast('Não foi possível remover o curso.', 'error');
      }
    }
  };

  const filteredCourses = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.category.toLowerCase().includes(normalizedQuery) ||
        course.status.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [courses, query, statusFilter]);

  return (
    <DashboardLayout title="Gestão de Cursos" role="admin">
      <div className="space-y-8">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Link href="/administrador" className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                 <ArrowLeft size={20} />
              </Link>
              <div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Academia <span className="text-primary text-glow">ECOA</span></h2>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Criação e monitoramento de conteúdo educacional</p>
              </div>
           </div>
           
           {canManageCourses && (
             <Button asChild className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl px-6">
                <Link href="/administrador/cursos/create">
                  <Plus size={18} className="mr-2" /> Criar Novo Curso
                </Link>
             </Button>
           )}
        </header>

        {!canManageCourses && <LockedFeature feature="courses:manage" />}

        {canManageCourses && (
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between rounded-3xl border border-white/5 bg-[#080808] p-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="Buscar por título, categoria ou status..."
                className="w-full bg-black/40 border border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex">
              {['all', 'Iniciante', 'Intermediário', 'Avançado'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`h-12 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === filter
                      ? 'bg-primary text-black'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {filter === 'all' ? 'Todos' : filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {canManageCourses && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
           {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
             ))
           ) : (
             filteredCourses.map((course) => (
               <motion.div 
                 key={course.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-[#080808] border border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all group"
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                        <BookOpen size={24} />
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        course.status === 'Ativo' ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-500'
                     }`}>
                        {course.status}
                     </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-14 leading-tight">{course.title}</h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                     <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Users size={12} className="text-primary" /> {course.students} Alunos
                     </div>
                     <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Calendar size={12} /> {course.date}
                     </div>
                  </div>

                  <div className="flex items-center gap-2 pt-6 border-t border-white/5">
                     <Link 
                       href={`/administrador/cursos/view?cid=${encryptParam(course.id)}`}
                       className="flex-1 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all"
                     >
                        <Eye size={14} className="mr-2" /> Ver
                     </Link>
                     <Link
                       href={`/administrador/cursos/edit?cid=${encryptParam(course.id)}`}
                       className="w-10 h-10 bg-white/5 hover:bg-primary/10 hover:text-primary rounded-xl flex items-center justify-center transition-all"
                       title="Editar curso"
                     >
                        <Edit3 size={14} />
                     </Link>
                     <button 
                       onClick={() => handleDelete(course.id)}
                       className="w-10 h-10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl flex items-center justify-center transition-all text-slate-600"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
               </motion.div>
             ))
           )}
         </div>}

        {canManageCourses && !loading && filteredCourses.length === 0 && (
          <div className="rounded-3xl border border-white/5 bg-[#080808] p-12 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
            Nenhum curso encontrado.
          </div>
        )}

        {canManageCourses && <div className="mt-12">
          <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 text-glow">Impacto Geográfico da <span className="text-primary">Educação</span></h3>
          <ComplaintMap />
        </div>}
      </div>
    </DashboardLayout>
  );
}
