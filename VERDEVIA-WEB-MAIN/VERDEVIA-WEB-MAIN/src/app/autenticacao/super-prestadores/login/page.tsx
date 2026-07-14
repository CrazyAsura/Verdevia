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
import { ArrowRight, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SuperContractorsLoginPage() {
  const { login } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, 'super-contractor', values.password);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#020408] text-[#e0e0e0] font-sans overflow-hidden">
      <div className="lg:w-1/2 relative hidden lg:block overflow-hidden bg-slate-900 border-r border-blue-500/10">
        <Image 
          src="/assets/contractors_bg.png" 
          fill
          priority
          className="object-cover opacity-20 grayscale blur-xs"
          alt="Super Contractor"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#020408] via-transparent to-transparent opacity-60" />
        
        <div className="relative z-10 h-full flex flex-col justify-center p-20">
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-[0_0_40px_-5px_#2563eb]"
           >
             <Layers size={32} />
           </motion.div>
           <h1 className="text-6xl font-black uppercase italic leading-[0.9] mb-6 text-white">
             Gestão de <br /> <span className="text-blue-500">Rede Global</span>
           </h1>
           <p className="text-lg text-slate-400 font-medium italic border-l-4 border-blue-500 pl-6">
             Supervisão estratégica de infraestrutura e parceiros subordinados.
           </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-[#020408]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md bg-white/2 border border-white/5 p-10 rounded-3xl"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight">Login <span className="text-blue-500">Super</span></h2>
            <p className="text-slate-500 text-sm font-medium mt-2">Área de Supervisão de Contratos</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-600">ID de Supervisor</FormLabel>
                    <FormControl>
                      <Input placeholder="supervisor@VERDEVIA.app" {...field} className="bg-black/40 border-white/10 h-14 rounded-xl focus:border-blue-500 transition-all uppercase text-xs" />
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
                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-slate-600">Chave Mestra</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} className="bg-black/40 border-white/10 h-14 rounded-xl focus:border-blue-500 transition-all" buttonClassName="text-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex flex-col gap-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 group transition-all">
                  Acessar Sistema <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center justify-between mt-6 px-1">
                  <Link href="/autenticacao/super-prestadores/forgot-password"  className="text-[10px] uppercase font-bold text-slate-500 hover:text-blue-500 transition-colors">Recuperar Chave</Link>
                  <span className="text-[10px] uppercase font-bold text-slate-800 opacity-50 cursor-not-allowed">Acesso Restrito</span>
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </main>
  );
}


