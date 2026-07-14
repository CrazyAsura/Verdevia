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
import { Terminal, ArrowLeft, ShieldAlert } from 'lucide-react';
import AuthService from '@/services/auth.service';

export default function SuperAdminForgotPasswordPage() {
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
      const response = await AuthService.requestPasswordReset(data.email, 'super-admin');
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      setSubmitError(getResetError(error));
      form.setError('email', { message: 'SMTP recovery channel unavailable.' });
    }
  };

  return (
    <main className="min-h-screen bg-[#020203] text-[#a855f7] font-mono selection:bg-[#a855f7] selection:text-black flex items-center justify-center relative overflow-hidden">
      {/* Background Matrix/Data Effect */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/assets/super_admin_bg.png" 
          fill
          priority
          className="object-cover opacity-10" 
          alt="" 
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#020203]/90 to-[#020203]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-lg p-px bg-[#a855f7]/30 rounded-sm"
      >
        <div className="bg-[#050508] p-12 border border-[#a855f7]/10 relative">
           {/* Scanline decoration */}
           <div className="absolute inset-0 pointer-events-none bg-size-[100%_4px] bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px)] z-20" />
           
           <header className="mb-12">
              <Link href="/autenticacao/super-administrador/login" className="inline-flex items-center text-[8px] uppercase font-black tracking-widest text-[#a855f7]/40 hover:text-white transition-colors mb-8">
                <ArrowLeft size={12} className="mr-2" /> Abort Reset
              </Link>
              <div className="flex items-center gap-4 mb-4">
                 <ShieldAlert className="text-[#a855f7]" size={32} />
                 <h1 className="text-2xl font-black uppercase tracking-tighter">Emergency <span className="text-white">Override</span></h1>
              </div>
              <p className="text-[#a855f7]/60 text-[10px] leading-relaxed uppercase tracking-wider">
                Credential recovery protocol initiated. Please provide the primary administrative identifier.
              </p>
           </header>

           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-500">Target Identifier</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="ROOT@VERDEVIA.SYS" {...field} className="bg-black border-[#a855f7]/20 h-14 rounded-none focus:ring-1 focus:ring-[#a855f7] text-sm text-[#a855f7] font-mono uppercase" />
                          <Terminal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6">
                  {submitError && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-red-500">{submitError}</p>}
                  {successMessage && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#a855f7]">{successMessage}</p>}
                  <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-16 bg-transparent border border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7] hover:text-black font-black uppercase tracking-[0.5em] text-xs transition-all duration-500 overflow-hidden relative group">
                    <span className="relative z-10">{form.formState.isSubmitting ? 'Executing...' : 'Execute Recovery'}</span>
                    <div className="absolute inset-0 bg-[#a855f7] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </Button>
                </div>
             </form>
           </Form>

           {/* Decorative UI elements */}
           <div className="mt-12 flex justify-between items-end">
              <div className="text-[6px] font-mono text-slate-800 space-y-1">
                 <div>AUTH_STATE: WAITING_FOR_ID</div>
                 <div>ENCRYPTION: RSA_4096_ACTIVE</div>
              </div>
              <div className="flex gap-1">
                 <div className="w-1 h-1 bg-[#a855f7]/40 animate-pulse" />
                 <div className="w-1 h-1 bg-[#a855f7]/20" />
                 <div className="w-1 h-1 bg-[#a855f7]/10" />
              </div>
           </div>
        </div>
      </motion.div>
    </main>
  );
}

function getResetError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || 'SMTP recovery channel failed.';
  }
  return 'Recovery service unavailable.';
}


