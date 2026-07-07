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
import { HardHat, ArrowLeft, Wrench } from 'lucide-react';
import AuthService from '@/services/auth.service';

export default function ContractorsForgotPasswordPage() {
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
      const response = await AuthService.requestPasswordReset(data.email, 'contractor');
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      setSubmitError(getResetError(error));
      form.setError('email', { message: 'Envio indisponível no momento.' });
    }
  };

  return (
    <main className="min-h-screen flex bg-[#0c0c0c] text-[#e0e0e0] overflow-hidden">
      {/* Background Decor */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden border-r border-white/5">
        <Image 
          src="/assets/contractors_bg.png" 
          fill
          priority
          className="object-cover opacity-20 grayscale" 
          alt="Industrial Background" 
        />
        <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0c0c0c]" />
        
        <div className="relative z-10 flex flex-col justify-center p-20">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-20 h-20 bg-[#f59e0b] rounded-2xl flex items-center justify-center text-black mb-8 shadow-[0_0_50px_-10px_#f59e0b]"
           >
             <Wrench size={40} />
           </motion.div>
           <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">
             Recuperar <br /> <span className="text-[#f59e0b]">Chave Técnica</span>
           </h1>
           <p className="text-slate-500 text-lg font-medium italic border-l-2 border-[#f59e0b] pl-6">
             Protocolo de redefinição de acesso para parceiros de campo.
           </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0e0e0e]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <Link href="/autenticacao/prestadores/login" className="inline-flex items-center text-[10px] uppercase font-black tracking-widest text-slate-600 hover:text-[#f59e0b] transition-colors group">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Retornar
            </Link>
            <h2 className="text-3xl font-black uppercase tracking-tight mt-6">Esqueceu a Credencial?</h2>
            <p className="text-slate-500 text-sm mt-2">Informe seu e-mail de prestador cadastrado.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-600">E-mail do Prestador</FormLabel>
                    <FormControl>
                      <Input placeholder="CONTATO@EMPRESA.COM.BR" {...field} className="bg-black/40 border-white/10 h-14 rounded-xl focus:border-[#f59e0b] transition-all uppercase text-xs font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                {submitError && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-red-500">{submitError}</p>}
                {successMessage && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">{successMessage}</p>}
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-14 bg-[#f59e0b] hover:bg-[#d97706] text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-orange-950/20">
                  {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-12 p-6 rounded-2xl bg-white/2 border border-white/5">
             <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                   <HardHat size={20} />
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase text-slate-400">Suporte Técnico</h4>
                   <p className="text-[9px] text-slate-600">Problemas com o acesso? Entre em contato com a central.</p>
                </div>
             </div>
          </div>
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


