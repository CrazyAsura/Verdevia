'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Cpu, Lock, Terminal, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SuperAdminLoginPage() {
  const [booting, setBooting] = useState(true);
  const { login } = useAuth();
  
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    console.log('Formulário submetido (Super Admin):', values);
    try {
      await login(values.email, 'super-admin', values.password);
    } catch (error) {
      console.error('Erro no onSubmit:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#020203] text-[#a855f7] font-mono selection:bg-[#a855f7] selection:text-black overflow-hidden flex items-center justify-center relative">
      {/* Background Matrix/Data Effect */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/assets/super_admin_bg.png" 
          fill
          priority
          className="object-cover opacity-20" 
          alt="" 
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#020203]/80 to-[#020203]" />
      </div>

      <AnimatePresence>
        {booting ? (
          <motion.div 
            key="boot"
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-50 text-center"
          >
            <Cpu className="w-16 h-16 animate-pulse mb-4 mx-auto text-[#a855f7]" />
            <div className="text-[10px] uppercase tracking-[0.5em] font-bold">Iniciando Protocolo de Segurança...</div>
          </motion.div>
        ) : (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-lg p-1 bg-linear-to-br from-[#a855f7]/20 to-transparent rounded-lg"
          >
            <div className="bg-[#050508] p-10 rounded-lg border border-[#a855f7]/10 relative overflow-hidden">
               {/* Terminal Scanline */}
               <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-20 bg-size-[100%_2px,3px_100%]" />
               
               <div className="mb-12 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                      <Terminal size={24} className="text-[#a855f7]" />
                      Super<span className="text-white">Admin</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Activity size={10} className="animate-pulse text-green-500" />
                      <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Status: Terminal Seguro Ativo</span>
                    </div>
                  </div>
                  <div className="p-2 border border-[#a855f7]/20 rounded-md">
                    <Lock size={20} className="text-[#a855f7]" />
                  </div>
               </div>

               <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] uppercase tracking-[0.3em] font-black text-[#a855f7]/60">Identificador de Acesso</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Input placeholder="superadmin@VERDEVIA.app" {...field} className="bg-black/60 border-[#a855f7]/20 h-14 rounded-none focus:ring-[#a855f7] focus:border-[#a855f7] text-sm text-[#a855f7] font-mono placeholder:text-[#a855f7]/20" />
                               <div className="absolute top-0 right-0 h-full w-1 bg-[#a855f7]/40" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[8px] uppercase" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] uppercase tracking-[0.3em] font-black text-[#a855f7]/60">Chave Criptográfica</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <PasswordInput placeholder="••••••••••••" {...field} className="bg-black/60 border-[#a855f7]/20 h-14 rounded-none focus:ring-[#a855f7] focus:border-[#a855f7] text-sm text-[#a855f7] font-mono placeholder:text-[#a855f7]/20" buttonClassName="right-5 text-[#a855f7]" />
                               <div className="absolute top-0 right-0 h-full w-1 bg-[#a855f7]/40 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[8px] uppercase" />
                        </FormItem>
                      )}
                    />

                    <div className="pt-6 space-y-6">
                      <Button type="submit" className="w-full h-14 bg-transparent border border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7] hover:text-black font-black uppercase tracking-[0.4em] text-xs transition-all duration-300 relative group overflow-hidden">
                        <span className="relative z-10">Autenticar Sistema</span>
                        <div className="absolute inset-0 bg-[#a855f7] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                      </Button>
                      
                      <div className="flex items-center justify-between">
                         <Link href="/autenticacao/super-administrador/forgot-password" className="text-[8px] uppercase font-bold text-slate-600 hover:text-[#a855f7] transition-colors tracking-widest underline decoration-dotted">Recuperar Chave</Link>
                         <span className="text-[8px] uppercase font-bold text-slate-800 opacity-50 cursor-not-allowed tracking-widest">Nó Restrito</span>
                      </div>
                    </div>
                 </form>
               </Form>

               {/* Decorative Terminal Code Lines */}
               <div className="mt-12 opacity-20 pointer-events-none">
                  <p className="text-[6px] font-mono leading-tight uppercase">
                    [SYSTEM_LOG]: Attempting handshake with node_br_01...<br/>
                    [SYSTEM_LOG]: Encrypted tunnel established. AES-256 active.<br/>
                    [SYSTEM_LOG]: Waiting for user credentials...
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}


