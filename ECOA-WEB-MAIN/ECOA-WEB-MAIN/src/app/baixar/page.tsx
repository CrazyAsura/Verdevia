'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Smartphone, Apple, PlayCircle, Shield, Zap, Bell, CheckCircle2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

const appFeatures = [
  { icon: Shield, title: "Envio Seguro", desc: "Denúncias verificadas por IA contra deepfakes." },
  { icon: Bell, title: "Alertas Reais", desc: "Notificações via GPS para incidentes próximos." },
  { icon: Zap, title: "Fórum Agil", desc: "Interface otimizada para discussões rápidas." },
];

export default function DownloadPage() {
  const [mode, setMode] = React.useState<'stable' | 'development'>('stable');
  const [hostname, setHostname] = React.useState<string>('localhost');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background relative overflow-hidden mesh-gradient pb-20">
      <Header />

      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto pt-40 px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[9px] uppercase font-black tracking-widest text-primary">Disponível para iOS & Android</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8">
              A Voz da sua <br /> <span className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent font-black">Comunidade</span>
            </h1>

            <p className="text-muted-foreground text-xl italic mb-12 max-w-lg">
              Transformamos seu smartphone em uma ferramenta poderosa de fiscalização e mudança social.
              Instale o ECOA e comece a impactar seu bairro agora mesmo.
            </p>

            {/* Mode Segmented Control */}
            <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8 relative">
              <button
                onClick={() => setMode('stable')}
                type="button"
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer z-10 ${
                  mode === 'stable' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Estável (Produção)
                {mode === 'stable' && (
                  <motion.div
                    layoutId="active-mode"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setMode('development')}
                type="button"
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer z-10 ${
                  mode === 'development' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                Desenvolvimento (Wi-Fi)
                {mode === 'development' && (
                  <motion.div
                    layoutId="active-mode"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Dynamic Download Actions */}
            <div className="flex flex-col gap-10 mb-16">
              {mode === 'stable' ? (
                <div className="flex flex-wrap gap-6">
                  {/* Android Master Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button className="h-24 px-10 gap-5 bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all rounded-3xl group relative overflow-hidden shadow-2xl shadow-primary/20" asChild>
                      <a href="/ECOA.apk" download>
                        <div className="p-3 bg-primary/20 rounded-2xl group-hover:bg-primary/40 transition-colors">
                          <Smartphone className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Android Stable</p>
                          <p className="text-2xl font-black uppercase tracking-tighter leading-none">Baixar APK</p>
                        </div>
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      </a>
                    </Button>
                  </motion.div>

                  {/* iPhone Master Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button className="h-24 px-10 gap-5 bg-[#3B82F6]/10 border-2 border-[#3B82F6]/30 hover:bg-[#3B82F6]/20 hover:border-[#3B82F6]/50 transition-all rounded-3xl group relative overflow-hidden backdrop-blur-xl shadow-2xl shadow-[#3B82F6]/20" asChild>
                      <a href="/ECOA.ipa" download>
                        <div className="p-3 bg-[#3B82F6]/20 rounded-2xl group-hover:bg-[#3B82F6]/40 transition-colors">
                          <Apple className="w-8 h-8 text-[#3B82F6]" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] uppercase font-black text-[#3B82F6] tracking-widest mb-1">iOS Enterprise</p>
                          <p className="text-2xl font-black uppercase tracking-tighter leading-none">Baixar IPA</p>
                        </div>
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      </a>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap gap-6">
                    {/* Android Dev Client Button */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Button className="h-24 px-10 gap-5 bg-primary/10 border-2 border-primary/40 hover:bg-primary/20 transition-all rounded-3xl group relative overflow-hidden shadow-2xl shadow-primary/20" asChild>
                        <a href={`http://${hostname}:8082/`}>
                          <div className="p-3 bg-primary/25 rounded-2xl group-hover:bg-primary/45 transition-colors">
                            <Smartphone className="w-8 h-8 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Android Dev Client</p>
                            <p className="text-2xl font-black uppercase tracking-tighter leading-none">Baixar via Wi-Fi</p>
                          </div>
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </a>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl max-w-xl text-left backdrop-blur-md">
                    <h4 className="text-xs font-black uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-pulse" /> Requisitos de Conexão (Wi-Fi)
                    </h4>
                    <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-1.5 leading-relaxed">
                      <li>Seu dispositivo móvel e este computador <strong>devem estar no mesmo Wi-Fi</strong>.</li>
                      <li>O servidor de compartilhamento deve estar ativo no terminal do app mobile: <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white font-mono">npm run share-apk</code>.</li>
                      <li>Certifique-se de compilar o app antes de compartilhar pela primeira vez ou ao alterar códigos nativos.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Legacy/Store Links (Secondary) */}
              <div className="flex items-center gap-8 opacity-40 hover:opacity-100 transition-all duration-500">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ou via Lojas Oficiais:</p>
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => showToast('App Store ainda não publicada. Use o IPA Enterprise acima.', 'info')}
                    className="hover:text-primary transition-colors"
                    title="App Store ainda não publicada"
                  >
                    <Apple className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Google Play ainda não publicada. Use o APK acima.', 'info')}
                    className="hover:text-primary transition-colors"
                    title="Google Play ainda não publicada"
                  >
                    <PlayCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Micro Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {appFeatures.map((f, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <f.icon className="w-5 h-5 text-primary mb-2" />
                  <h4 className="text-xs font-black uppercase tracking-widest">{f.title}</h4>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="flex-1 relative"
          >
            {/* Glowing Halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse" />

            {/* Phone Body */}
            <div className="w-[320px] h-[640px] mx-auto bg-zinc-950 border-10 border-zinc-900 rounded-[3.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20" />

              {/* App Content Preview */}
              <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 mb-10 p-4 glass rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20 relative">
                  <Image src="/logo.png" alt="Logo" fill className="object-contain p-4" />
                </div>

                <div className="p-6 glass border-white/5 rounded-2xl w-full flex flex-col items-center">
                  <div className="w-32 h-32 bg-white p-2 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-black/25">
                    {mounted ? (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                          mode === 'development' ? `http://${hostname}:8082/` : `http://${hostname}:3000/baixar`
                        )}`}
                        alt="QR Code de Download"
                        className="w-28 h-28 object-contain"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-zinc-900 rounded-xl animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    {mode === 'development' ? 'Escaneie para Instalar' : 'Escaneie para Baixar'}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[9px] font-bold uppercase">
                      {mode === 'development' ? 'v1.0.0 - Dev Client' : 'v1.2.5 - Stable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Floating Info */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-20 -right-10 glass p-4 border-primary/20 rounded-xl hidden lg:flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase">Segurança IA</p>
                <p className="text-[9px] text-muted-foreground">Filtro de Deepfake Ativo</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Trust Footer */}
      <div className="container mx-auto px-6 mt-32 text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.6em] text-muted-foreground opacity-30">Padrão de Segurança SOC2 & LGPD Compliance</p>
      </div>
    </main>
  );
}

