'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginPageV2() {
  const { login } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, 'admin', values.password);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#050505] text-white selection:bg-primary selection:text-black">
      {/* Left Side: Cinematic Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <Image 
          src="/assets/sao_paulo.jpg" 
          fill
          priority
          className="object-cover opacity-60 grayscale blur-xs" 
          alt="ECOA Background" 
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#050505] via-transparent to-transparent opacity-80" />
        
        <div className="relative z-10 flex flex-col justify-end p-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-px bg-primary" />
              <span className="text-primary font-black uppercase tracking-[0.6em] text-[10px] block">Acesso Restrito</span>
            </div>
            <h1 className="text-8xl font-black uppercase italic leading-[0.75] mb-8 tracking-tighter">
              Conecte-se <br /> ao <span className="text-primary">Impacto</span>
            </h1>
            <p className="max-w-md text-muted-foreground italic text-lg leading-relaxed">
              Gerencie a maior rede de monitoramento social do país com inteligência estratégica e dados em tempo real.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#080808]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
             <div className="w-12 h-1 bg-primary mb-8" />
             <h2 className="text-4xl font-black uppercase italic tracking-tighter">Login <span className="text-primary">Especialista</span></h2>
             <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold">Identifique-se para acessar o terminal de gestão</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground/60">Credencial de E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@ECOA.app" {...field} className="h-16 bg-white/5 border-white/10 rounded-none focus:border-primary transition-all text-lg font-medium" />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground/60">Senha do Sistema</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} className="h-16 bg-white/5 border-white/10 rounded-none focus:border-primary transition-all text-lg font-medium" buttonClassName="text-primary" />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold text-red-500" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-6 pt-4">
                <Button type="submit" className="h-16 w-full text-lg uppercase font-black tracking-widest rounded-none bg-primary hover:bg-primary/90 text-black shadow-[0_10px_40px_-10px_rgba(32,201,151,0.3)] group overflow-hidden relative">
                  <span className="relative z-10">Autenticar Agora</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">
                   <Link href="/autenticacao/administrador/forgot-password" className="hover:text-primary transition-colors">Recuperar Acesso</Link>
                   <span className="opacity-50 cursor-not-allowed">Registro Bloqueado</span>
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </main>
  );
}


