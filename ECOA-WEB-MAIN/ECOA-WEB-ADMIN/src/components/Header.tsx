'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';

export const Header = () => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-6 glass h-20"
    >
      {/* Brand Gradient Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#10B981] to-[#3B82F6]" />

      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <Image src="/logo.svg" alt="ECOA" width={32} height={32} priority className="h-8 w-8" />
        <span className="text-lg sm:text-xl font-black tracking-tighter uppercase italic text-glow">ECOA</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors cursor-pointer">Início</Link>
        <Link href="/sobre" className="hover:text-primary transition-colors cursor-pointer">Sobre</Link>
        <Link href="/servicos" className="hover:text-primary transition-colors cursor-pointer">Serviços</Link>
        <Link href="/planos" className="hover:text-primary transition-colors cursor-pointer">Planos</Link>
        <Link href="/perguntas-frequentes" className="hover:text-primary transition-colors cursor-pointer">Perguntas Frequentes</Link>
      </nav>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <ThemeToggle />
      </div>
    </motion.header>
  );
};
