'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import AuthService from '@/services/auth.service';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('VERDEVIA_token') : null;
    if (token) {
      router.push('/painel');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthService.login(email, password);
      // Verify role
      const role = response.user.role.toLowerCase().replace(/_/g, '-');
      if (role !== 'admin' && role !== 'super-admin') {
        setError('Acesso negado. Apenas administradores do portal de carreiras podem entrar.');
        AuthService.clearSession();
        return;
      }
      AuthService.persistSession(response.user, response.token);
      router.push('/painel');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Credenciais inválidas ou erro ao conectar com o gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background relative mesh-gradient text-foreground flex items-center justify-center py-20 px-6">
      <Header />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-lg bg-card/40 border border-border/80 backdrop-blur-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
            Portal de <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Carreiras</span>
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
            Acesso Restrito a Administradores
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-2 font-extrabold">E-mail Corporativo</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background/50 border border-border/80 rounded pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="nome@verdevia.app"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-2 font-extrabold">Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-border/80 rounded pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-[11px] flex items-center gap-2 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 uppercase tracking-widest font-black bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded hover:from-emerald-600 hover:to-blue-600 border-none glow-green text-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
