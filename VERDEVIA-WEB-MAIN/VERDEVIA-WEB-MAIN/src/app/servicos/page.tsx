'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Features } from '@/components/Features';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-24">
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-center">Nossos <span className="text-primary text-glow">Serviços</span></h1>
            <p className="text-muted-foreground text-center uppercase tracking-[0.4em] text-[10px] font-extrabold mb-12">Tecnologia a serviço da cidadania</p>
        </div>
        <Features />
        
        <section className="py-20 container mx-auto px-6">
            <div className="glass p-12 border-primary/20 text-center">
                <h3 className="text-2xl font-bold uppercase mb-4">Integração com Órgãos Públicos</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto italic mb-8">
                    Oferecemos dashboards exclusivos para prefeituras e secretarias acompanharem a demanda popular e otimizarem a logística de manutenção.
                </p>
                <Link href="/planos" className="inline-block px-8 py-4 border border-primary text-primary uppercase font-black text-xs tracking-widest hover:bg-primary hover:text-background transition-all cursor-pointer">
                    Solicitar Parceria
                </Link>
            </div>
        </section>
      </div>
    </main>
  );
}


