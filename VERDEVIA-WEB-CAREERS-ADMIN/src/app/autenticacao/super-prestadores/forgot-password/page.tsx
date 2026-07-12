'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthService from '@/services/auth.service';

export default function SuperContractorsForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setSubmitError('');
    setSuccessMessage('');
    try {
      const response = await AuthService.requestPasswordReset(data.email, 'super-contractor');
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      setSubmitError(getResetError(error));
      form.setError('email', { message: 'Envio indisponível no momento.' });
    }
  };

  return (
    <main className="min-h-screen flex bg-[#020408] text-white selection:bg-blue-500/30 selection:text-white">
      {/* Background Side */}
      <div className="hidden lg:flex lg:w-1/3 relative overflow-hidden border-r border-blue-500/10">
        <Image 
          src="/assets/contractors_bg.png" 
          fill
          className="absolute inset-0 object-cover opacity-10 grayscale" 
          alt="Background" 
          priority
        />
        <div className="absolute inset-0 bg-[#020408]/80" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={16} className="text-white" />
             </div>
             <span className="font-black uppercase tracking-[0.4em] text-[10px] text-blue-500">Security Override</span>
           </div>
           
           <div>
             <h2 className="text-4xl font-black uppercase italic leading-none mb-4">Reset <br /> <span className="text-blue-500 text-6xl">Master</span></h2>
             <p className="text-slate-500 text-sm font-medium italic">Ambiente de supervisão de segurança.</p>
           </div>
           
           <div className="text-[8px] uppercase tracking-widest text-slate-800 font-black">
              © 2026 VERDEVIA SUPERVISION
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#020408]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <header className="space-y-4">
            <Link href="/autenticacao/super-prestadores/login" className="inline-flex items-center text-[10px] uppercase font-black tracking-widest text-slate-600 hover:text-blue-500 transition-colors group">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Retornar ao Portal
            </Link>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Esqueceu a <span className="text-blue-500">Chave Mestra?</span></h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Solicite um novo código de acesso para supervisão.
            </p>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="uppercase text-[9px] font-black tracking-[0.2em] text-slate-600">ID de Supervisor</FormLabel>
                    <FormControl>
                      <Input placeholder="SUPER@EMPRESA.COM.BR" {...field} className="h-16 bg-white/5 border-white/10 rounded-xl focus:border-blue-500 transition-all text-sm font-bold tracking-wider uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                {submitError && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-red-500">{submitError}</p>}
                {successMessage && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-blue-500">{successMessage}</p>}
                <Button type="submit" disabled={form.formState.isSubmitting} className="h-16 w-full text-sm uppercase font-black tracking-[0.3em] rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.3)]">
                  {form.formState.isSubmitting ? 'Enviando...' : 'Solicitar Redefinição'}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </main>
  );
}

function getResetError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || 'Falha ao enviar e-mail de recuperação.';
  }
  return 'Não foi possível conectar ao serviço de recuperação.';
}


