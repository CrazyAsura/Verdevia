'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { decryptParam } from '@/lib/crypto';
import { showToast } from '@/lib/toast';
import CoursesService, { Course } from '@/services/courses.service';
import { ArrowLeft, Save, X } from 'lucide-react';

type CourseForm = {
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
};

export default function EditCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = useMemo(() => decryptParam(searchParams.get('cid') ?? ''), [searchParams]);
  const [formData, setFormData] = useState<CourseForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) {
        router.push('/administrador/cursos');
        return;
      }

      try {
        const course: Course = await CoursesService.getCourse(courseId);
        setFormData({
          title: course.title,
          category: course.category || '',
          level: course.level || 'Iniciante',
          duration: course.duration || '',
          description: course.description || '',
        });
      } catch {
        showToast('Curso não encontrado.', 'error');
        router.push('/administrador/cursos');
      }
    }

    loadCourse();
  }, [courseId, router]);

  const update = (field: keyof CourseForm, value: string) => {
    setFormData((current) => current ? { ...current, [field]: value } : current);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData || !courseId) return;

    setSaving(true);
    try {
      await CoursesService.updateCourse(courseId, formData);
      showToast('Curso atualizado com sucesso.', 'success');
      router.push('/administrador/cursos');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Não foi possível atualizar o curso.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Editar Curso" role="admin">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <Link href="/administrador/cursos" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} className="mr-2" />
            <span className="text-xs font-black uppercase tracking-widest">Voltar à Gestão</span>
          </Link>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Editar <span className="text-primary text-glow">Curso</span></h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Atualize dados e conteúdo educacional</p>
        </header>

        {formData && (
          <form onSubmit={handleSave} className="space-y-8">
            <section className="rounded-3xl border border-white/5 bg-[#080808] p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Título">
                  <Input value={formData.title} onChange={(event) => update('title', event.target.value)} className="bg-white/5 border-white/10 text-white" required />
                </Field>
                <Field label="Categoria">
                  <Input value={formData.category} onChange={(event) => update('category', event.target.value)} className="bg-white/5 border-white/10 text-white" required />
                </Field>
                <Field label="Nível">
                  <select value={formData.level} onChange={(event) => update('level', event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#080808] px-3 text-sm text-white outline-none focus:border-primary">
                    <option>Iniciante</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </Field>
                <Field label="Duração">
                  <Input value={formData.duration} onChange={(event) => update('duration', event.target.value)} className="bg-white/5 border-white/10 text-white" required />
                </Field>
              </div>
              <div className="mt-6">
                <Field label="Descrição">
                  <Textarea value={formData.description} onChange={(event) => update('description', event.target.value)} rows={8} className="bg-white/5 border-white/10 text-white resize-none" />
                </Field>
              </div>
            </section>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push('/administrador/cursos')} className="border-white/10 text-slate-400 hover:text-white px-8">
                <X size={16} className="mr-2" /> Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest px-8">
                <Save size={16} className="mr-2" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
  );
}
