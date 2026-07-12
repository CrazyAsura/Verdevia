'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { decryptParam, encryptParam } from '@/lib/crypto';
import { showToast } from '@/lib/toast';
import CoursesService, { Course } from '@/services/courses.service';
import { ArrowLeft, BookOpen, Calendar, Edit3, FileText, PlayCircle, Users } from 'lucide-react';

export default function ViewCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = useMemo(() => decryptParam(searchParams.get('cid') ?? ''), [searchParams]);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) {
        router.push('/administrador/cursos');
        return;
      }

      try {
        setCourse(await CoursesService.getCourse(courseId));
      } catch {
        showToast('Curso não encontrado.', 'error');
        router.push('/administrador/cursos');
      }
    }

    loadCourse();
  }, [courseId, router]);

  return (
    <DashboardLayout title="Detalhes do Curso" role="admin">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/administrador/cursos" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">{course?.title ?? 'Carregando curso'}</h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Academia VERDEVIA / {course?.category ?? '--'}</p>
            </div>
          </div>
          {course && (
            <Button asChild className="h-12 bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] rounded-xl px-6">
              <Link href={`/administrador/cursos/edit?cid=${encryptParam(course.id)}`}>
                <Edit3 size={16} className="mr-2" /> Editar Curso
              </Link>
            </Button>
          )}
        </header>

        <section className="grid gap-6 md:grid-cols-4">
          <Summary icon={<BookOpen />} label="Nível" value={course?.level ?? '--'} />
          <Summary icon={<Users />} label="Módulos" value={String(course?.modules?.length ?? course?.modulesCount ?? 0)} />
          <Summary icon={<Calendar />} label="Publicação" value={course?.createdAt ? new Date(course.createdAt).toLocaleDateString('pt-BR') : '--'} />
          <Summary icon={<PlayCircle />} label="Duração" value={course?.duration ?? 'Não definida'} />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-white/5 bg-[#080808] p-8">
            <h2 className="mb-4 text-lg font-black uppercase tracking-tight">Descrição</h2>
            <p className="text-sm leading-7 text-slate-300">{course?.description ?? 'Curso sem descrição cadastrada.'}</p>
          </div>
          <div className="rounded-3xl border border-white/5 bg-[#080808] p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <FileText size={18} className="text-primary" /> Estrutura
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              {course?.modules?.length ? `${course.modules.length} módulo(s) cadastrado(s).` : 'Nenhum módulo cadastrado.'}
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#080808] p-6">
      <div className="mb-4 text-primary">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
