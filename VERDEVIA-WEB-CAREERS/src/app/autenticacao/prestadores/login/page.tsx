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
import { HardHat, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ContractorsLoginPage() {
  const { login } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    console.log('Formulário submetido (Contractor):', values);
    try {
      await login(values.email, 'contractor', values.password);
    } catch (error) {
      console.error('Erro no onSubmit:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#0c0c0c] text-[#e0e0e0] font-sans overflow-hidden">
      {/* Left Decoration / Hero */}
      <div className="lg:w-1/2 relative hidden lg:block overflow-hidden bg-slate-900 border-r border-white/5">
        <Image 
          src="/assets/contractors_bg.png" 
          fill
          priority
          className="object-cover opacity-30 grayscale blur-xs"
          alt="Operacional"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0c0c0c] via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-transparent to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-[#f59e0b] text-black rounded-sm rotate-3">
               <HardHat size={32} strokeWidth={2.5} />
             </div>
             <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-[#f59e0b]">VERDEVIA <span className="text-white">FIELD</span></h3>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Operações em Campo</p>
             </div>
          </div>

          <div className="max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black uppercase italic leading-[0.9] mb-6 text-white"
            >
              Construindo o <br /> <span className="text-[#f59e0b]">Amanhã</span> Hoje.
            </motion.h1>
            <p className="text-lg text-slate-300 font-medium border-l-4 border-[#f59e0b] pl-6 italic">
              Acesse sua central de serviços e gerencie seus projetos com precisão industrial.
            </p>
          </div>

          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#f59e0b]" /> Segurança Certificada</div>
            <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#f59e0b]" /> Monitoramento 24/7</div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background elements for mobile */}
        <div className="lg:hidden absolute inset-0 -z-10 overflow-hidden">
           <Image src="/assets/contractors_bg.png" fill className="object-cover opacity-20 blur-sm" alt="Background" />
           <div className="absolute inset-0 bg-[#0c0c0c]/80" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-md p-10 border border-white/10 rounded-2xl shadow-2xl"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Entrar no <span className="text-[#f59e0b]">Portal</span></h2>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Área exclusiva para Prestadores de Serviço</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Credencial de E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="prestador@verdevia.app" {...field} className="bg-black/40 border-white/10 h-14 rounded-xl focus:ring-[#f59e0b] focus:border-[#f59e0b] transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chave de Segurança</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} className="bg-black/40 border-white/10 h-14 rounded-xl focus:ring-[#f59e0b] focus:border-[#f59e0b] transition-all" buttonClassName="text-[#f59e0b]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex flex-col gap-4">
                <Button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-black h-14 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 group transition-all">
                  Iniciar Sessão <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center justify-between mt-6 px-1">
                  <Link href="/autenticacao/prestadores/forgot-password" className="text-[10px] uppercase font-bold text-slate-500 hover:text-[#f59e0b] transition-colors">Esqueci minha chave</Link>
                  <span className="text-[10px] uppercase font-bold text-slate-700 opacity-50 cursor-not-allowed">Registro Interno</span>
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </main>
  );
}


