'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Shield, Users, Target, Globe } from 'lucide-react';

const values = [
  { icon: Shield, title: "Segurança Absoluta", desc: "Criptografia de ponta a ponta e detecção de deepfakes." },
  { icon: Users, title: "Comunidade Ativa", desc: "Empoderamos o cidadão para ser o protagonista da mudança." },
  { icon: Target, title: "Precisão de Dados", desc: "Transformamos denúncias em dados acionáveis para gestão pública." },
  { icon: Globe, title: "Escala Nacional", desc: "Uma rede conectada de Manaus ao Chuí." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background mesh-gradient relative pb-20">
      <Header />

      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/assets/amazon_forest.jpg"
          alt="Amazon Cinematic"
          fill
          priority
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center px-6"
        >
          <h4 className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-4">Nossa Essência</h4>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-glow">VERDEVIA <span className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent font-black">Brasil</span></h1>
        </motion.div>
      </section>

      <div className="container mx-auto px-6 -mt-20 relative z-20">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl font-black uppercase italic mb-8 border-l-4 border-primary pl-6">Redefinindo o <br />Engajamento Social</h2>
            <p className="text-muted-foreground text-lg leading-relaxed italic mb-6">
              Fundada em Sergipe e pensada para operar em escala nacional, a VERDEVIA nasceu para encurtar o caminho
              entre o relato de um problema urbano e a resposta de quem pode resolvê-lo.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed italic">
              Utilizamos inteligência artificial, análise geoespacial e trilhas de auditoria para que cada incidente
              seja verificado, priorizado e acompanhado com transparência. A cidade vira um sistema vivo, legível e
              mais fácil de cuidar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square bg-muted overflow-hidden rounded-2xl border border-border rotate-3 hover:rotate-0 transition-transform duration-700 relative">
               <Image 
                 src="/assets/about_story.png" 
                 alt="Equipe VERDEVIA"
                 fill
                 className="object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100" 
               />
            </div>
            <div className="absolute -bottom-10 -left-10 glass p-8 border-primary/20 max-w-[250px] animate-float">
              <p className="text-3xl font-black text-primary mb-1">100%</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Compromisso com a Transparência</p>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 glass hover:border-primary/50 transition-all flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Brand Gradient Top Accent Border */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#10B981] to-[#3B82F6] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />
              
              {/* Dual Brand Gradient Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-[#3B82F6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center">
                <v.icon className="w-10 h-10 text-primary mb-6 group-hover:animate-float" />
                <h3 className="text-xl font-bold uppercase mb-4 tracking-tight group-hover:text-primary transition-colors">{v.title}</h3>
                <p className="text-muted-foreground text-sm italic">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}


