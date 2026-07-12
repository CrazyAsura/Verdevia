'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqCategories = [
  {
    title: "Plataforma & Uso",
    questions: [
      { q: "O VERDEVIA é gratuito para todos?", a: "Sim, o acesso básico para cidadãos realizarem denúncias e acessarem o mapa de calor é totalmente gratuito." },
      { q: "Como as autoridades recebem os dados?", a: "Temos um dashboard exclusivo com criptografia para governos parceiros que acessam os dados verificados em tempo real." }
    ]
  },
  {
    title: "Segurança & IA",
    questions: [
      { q: "O que é a detecção de Deepfake?", a: "Nossa IA analisa metadados e padrões de pixels para garantir que nenhuma denúncia seja baseada em imagens manipuladas ou falsas." },
      { q: "Meus dados pessoais são compartilhados?", a: "Nunca. Suas informações são protegidas pelo LGPD e você tem a opção de fazer denúncias 100% anônimas." }
    ]
  },
  {
    title: "Gamificação",
    questions: [
      { q: "Como ganho títulos e badges?", a: "Ao acumular XP através de denúncias resolvidas e contribuições úteis no fórum, você desbloqueia novos níveis no Passe de Recompensa." }
    ]
  }
];

export default function FAQPage() {

  return (
    <main className="min-h-screen bg-background mesh-gradient relative pb-20">
      <Header />
      
      <div className="container mx-auto pt-32 px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-20 text-center"
        >
          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-4 text-glow">Central de <span className="text-primary">Suporte</span></h1>
          <p className="text-muted-foreground uppercase tracking-[0.4em] text-xs font-bold">Respostas para a sua jornada comunitária</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
           {faqCategories.map((category, idx) => (
             <div key={idx} className="mb-12">
               <h3 className="text-primary font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-4">
                  <HelpCircle className="w-4 h-4" />
                  {category.title}
               </h3>
               
               <div className="space-y-4">
                 {category.questions.map((item, i) => (
                   <FAQItem key={i} question={item.q} answer={item.a} />
                 ))}
               </div>
             </div>
           ))}
        </div>
      </div>
    </main>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/60 transition-colors"
      >
        <span className="font-bold uppercase text-sm tracking-tight">{question}</span>
        {isOpen ? <Minus className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6"
          >
            <p className="text-muted-foreground italic text-sm leading-relaxed border-t border-border pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


