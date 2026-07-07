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
import { ArrowLeft, KeyRound } from 'lucide-react';
import AuthService from '@/services/auth.service';

export default function AdminForgotPasswordPage() {
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
      const response = await AuthService.requestPasswordReset(data.email, 'admin');
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      setSubmitError(getResetError(error));
      form.setError('email', { message: 'Não foi possível concluir o envio agora.' });
    }
  };

  return (
    <main className="min-h-screen flex bg-[#050505] text-white selection:bg-primary selection:text-black">
      {/* Cinematic Background Side */}
      <div className="hidden lg:flex lg:w-1/3 relative overflow-hidden border-r border-white/5">
        <Image 
          src="/assets/sao_paulo.jpg" 
          fill
          priority
          className="object-cover opacity-30 grayscale blur-[2px]" 
          alt="Background" 
        />
        <div className="absolute inset-0 bg-[#050505]/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <KeyRound size={16} className="text-black" />
             </div>
             <span className="font-black uppercase tracking-[0.4em] text-[10px]">Security Protocol</span>
           </div>
           
           <div>
             <h2 className="text-4xl font-black uppercase italic leading-none mb-4">Recuperação de <br /> <span className="text-primary text-6xl">Acesso</span></h2>
             <p className="text-muted-foreground text-sm font-medium italic">Ambiente restrito de gestão VERDEVIA.</p>
           </div>
           
           <div className="text-[8px] uppercase tracking-widest text-muted-foreground/30 font-black">
              © 2026 VERDEVIA STRATEGIC SYSTEMS
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#080808]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <header className="space-y-4">
            <Link href="/autenticacao/administrador/login" className="inline-flex items-center text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 hover:text-primary transition-colors group">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar ao Login
            </Link>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Esqueceu a <span className="text-primary">Senha?</span></h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Insira o e-mail administrativo associado à sua conta e enviaremos as instruções de redefinição.
            </p>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="uppercase text-[9px] font-black tracking-[0.2em] text-muted-foreground/60">E-mail Administrativo</FormLabel>
                    <FormControl>
                      <Input placeholder="ADMIN@verdevia.BR" {...field} className="h-16 bg-white/5 border-white/10 rounded-none focus:border-primary transition-all text-sm font-bold tracking-wider uppercase" />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold text-red-500" />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                {submitError && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-red-500">{submitError}</p>}
                {successMessage && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-primary">{successMessage}</p>}
                <Button type="submit" disabled={form.formState.isSubmitting} className="h-16 w-full text-sm uppercase font-black tracking-[0.3em] rounded-none bg-primary hover:bg-primary/90 text-black shadow-[0_10px_40px_-10px_rgba(32,201,151,0.3)]">
                  {form.formState.isSubmitting ? 'Enviando...' : 'Solicitar Redefinição'}
                </Button>
                <div className="mt-10 text-center">
                   <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/30">
                     Acesso técnico? <Link href="/suporte" className="text-primary hover:underline underline-offset-4 ml-2">Suporte 24h</Link>
                   </p>
                </div>
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


