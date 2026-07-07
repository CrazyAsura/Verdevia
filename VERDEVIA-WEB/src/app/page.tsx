'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { useStats } from "@/hooks/useStats";
import { Button } from "@/components/ui/button";

const Features = dynamic(() => import("@/components/Features").then(mod => mod.Features));
const BrazilGallery = dynamic(() => import("@/components/BrazilGallery").then(mod => mod.BrazilGallery));
const VerticalTicker = dynamic(() => import("@/components/VerticalTicker").then(mod => mod.VerticalTicker));
const HorizontalStories = dynamic(() => import("@/components/HorizontalStories").then(mod => mod.HorizontalStories));

export default function Home() {
  const { data: stats } = useStats();

  return (
    <main className="min-h-screen bg-background relative mesh-gradient">
      <Header />
      
      {/* Immersive Hero Carousel - National Scale */}
      <Hero />

      {/* Ticker integration */}
      <div className="relative mt-6 lg:mt-0 lg:absolute lg:top-[90vh] w-full z-30">
         <div className="container mx-auto px-6">
            <VerticalTicker />
         </div>
      </div>

      {/* Bento Grid Features - Technology focus */}
      <div className="py-20 relative z-10">
        <Features />
      </div>

      {/* Brazil Gallery - Visual showcase */}
      <BrazilGallery />

      {/* Horizontal Scroll Stories - The cinematic soul of the site */}
      <HorizontalStories />

      {/* Real-time Impact Summary */}
      <section className="py-32 bg-background/85 backdrop-blur-md relative z-10 border-y border-border/60">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
             {[
               { label: "Queixas Atendidas", val: stats?.totalComplaints || '0', detail: "Brasil" },
               { label: "Eco-Líderes", val: stats?.totalUsers || '0', detail: "Ativos" },
               { label: "Cidades Monitoradas", val: "120", detail: "Nacional" },
               { label: "Redução de Riscos", val: "32%", detail: "Deepfake Security" }
             ].map((st, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="flex flex-col items-center"
               >
                 <p className="text-6xl font-black bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent mb-2">{st.val}</p>
                 <p className="uppercase text-[10px] font-extrabold tracking-widest text-muted-foreground">{st.label}</p>
                 <p className="text-[8px] italic opacity-40 mt-1">{st.detail}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Final Galactic Call to Action */}
      <section className="py-40 bg-background relative overflow-hidden border-t border-border/60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-40" />
        <div className="container relative z-10 mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-12">O Futuro é <br /> <span className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent font-black">Comunitário</span></h2>
            <Link href="/baixar">
              <Button size="lg" className="h-20 px-16 text-xl font-black uppercase tracking-[0.2em] bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#0d9488] hover:to-[#2563eb] text-white glow-green rounded-none border-none shadow-[0_0_50px_-10px_#10B981]">
                Acessar Plataforma
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      <footer className="py-12 bg-background text-center text-muted-foreground border-t border-border/60">
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">© 2026 VERDEVIA NATIONAL NETWORK - BRAZIL</p>
      </footer>
    </main>
  );
}

