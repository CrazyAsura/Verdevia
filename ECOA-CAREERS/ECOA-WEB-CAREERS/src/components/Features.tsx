'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Zap, MessageSquare, Map, Database } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: "Evidência Confiável", desc: "IA verifica imagens e contexto antes de transformar relatos em ocorrências acionáveis.", size: "lg" },
  { icon: Zap, title: "Resposta Coordenada", desc: "Alertas e filas de prioridade conectam comunidade, operadores e gestão.", size: "sm" },
  { icon: Eye, title: "Leitura Preditiva", desc: "Mapas de calor revelam padrões de risco antes que pequenos problemas cresçam.", size: "sm" },
  { icon: MessageSquare, title: "Rede Comunitária", desc: "Discussões, cursos e reputação fortalecem participação local com responsabilidade.", size: "lg" },
  { icon: Map, title: "Território Vivo", desc: "Painéis geolocalizados mostram a situação de bairros, cidades e contratos.", size: "sm" },
  { icon: Database, title: "Dados Auditáveis", desc: "Relatórios e trilhas de auditoria dão clareza para prestação de contas.", size: "sm" },
];

export const Features = () => {
  return (
    <section id="servicos" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <h4 className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">Tecnologia operacional</h4>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">A plataforma <span className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent font-black">ECOA</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 glass hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col justify-between ${f.size === 'lg' ? 'md:col-span-2 h-[350px]' : 'h-[350px]'}`}
            >
              {/* Brand Gradient Top Accent Border */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#10B981] to-[#3B82F6] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />
              
              {/* Dual Brand Gradient Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-[#3B82F6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div>
                 <f.icon className="w-10 h-10 text-primary mb-6 group-hover:animate-float" />
                 <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tighter group-hover:text-primary transition-colors">{f.title}</h3>
                 <p className="text-muted-foreground text-sm italic leading-relaxed max-w-xs">{f.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-primary opacity-40 group-hover:opacity-100 mt-4">
                 Explorar Módulo <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
}
