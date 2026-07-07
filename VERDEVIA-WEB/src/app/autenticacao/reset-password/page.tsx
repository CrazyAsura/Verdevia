'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, KeyRound, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { resetPasswordSchema, ResetPasswordFormValues } from '@/lib/schemas';
import AuthService from '@/services/auth.service';

const loginRoutes: Record<string, string> = {
  admin: '/autenticacao/administrador/login',
  'super-admin': '/autenticacao/super-administrador/login',
  contractor: '/autenticacao/prestadores/login',
  'super-contractor': '/autenticacao/super-prestadores/login',
};

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message;
  }

  if (error instanceof Error) return error.message;
  return undefined;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050505]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [completed, setCompleted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const email = params.get('email')?.trim().toLowerCase() || '';
  const token = params.get('token') || '';
  const portal = params.get('portal') || 'admin';
  const loginRoute = useMemo(() => loginRoutes[portal] || loginRoutes.admin, [portal]);
  const hasValidLink = Boolean(email && token);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!hasValidLink) return;

    setSubmitError('');
    try {
      await AuthService.resetPassword(email, token, values.password);
      setCompleted(true);
      form.reset();
    } catch (error: unknown) {
      setSubmitError(
        getErrorMessage(error) ||
          'Link inválido, expirado ou indisponível. Solicite uma nova recuperação.',
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-white/10 bg-white/5 p-8 shadow-2xl"
      >
        {completed ? (
          <div className="space-y-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle size={34} />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black uppercase tracking-tighter">Senha Redefinida</h1>
              <p className="text-sm text-slate-400">
                Sua senha foi atualizada com segurança. Entre novamente pelo portal correto.
              </p>
            </div>
            <Button onClick={() => router.replace(loginRoute)} className="h-14 w-full rounded-none bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90">
              Ir para o Login
            </Button>
          </div>
        ) : (
          <>
            <header className="mb-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-primary/10 text-primary">
                {hasValidLink ? <KeyRound size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Nova Senha</h1>
                <p className="mt-2 text-sm text-slate-400">
                  {hasValidLink
                    ? `Redefinição protegida para ${email}.`
                    : 'Link de recuperação incompleto. Solicite um novo e-mail.'}
                </p>
              </div>
            </header>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nova Senha</FormLabel>
                      <FormControl>
                        <PasswordInput disabled={!hasValidLink} placeholder="Digite a nova senha" {...field} className="h-14 rounded-none bg-black/40 border-white/10 focus:border-primary" buttonClassName="text-primary" />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Confirmar Senha</FormLabel>
                      <FormControl>
                        <PasswordInput disabled={!hasValidLink} placeholder="Repita a nova senha" {...field} className="h-14 rounded-none bg-black/40 border-white/10 focus:border-primary" buttonClassName="text-primary" />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold text-red-500" />
                    </FormItem>
                  )}
                />

                {submitError && <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{submitError}</p>}

                <Button type="submit" disabled={!hasValidLink || form.formState.isSubmitting} className="h-14 w-full rounded-none bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90">
                  {form.formState.isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
              </form>
            </Form>

            <Link href={loginRoute} className="mt-8 block text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary">
              Voltar ao Login
            </Link>
          </>
        )}
      </motion.section>
    </main>
  );
}
