'use client';

import React from 'react';
import { motion } from 'framer-motion';

const items = [
  "Monitoramento Orla Atalaia",
  "Iluminação Púbica Coroa do Meio",
  "Sinalização Rodoviária Centro",
  "Limpeza Urbana Jardins",
  "Segurança Ativa Aruana",
  "Manutenção Passarela do Caranguejo"
];

export function VerticalTicker() {
  return (
    <div className="h-[40px] overflow-hidden relative glass border-none rounded-full px-6 flex items-center">
      <motion.div
        animate={{ y: [0, -120] }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "linear"
        }}
        className="flex flex-col gap-0"
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="h-[40px] flex items-center shrink-0">
             <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/80 whitespace-nowrap">
                LIVE: {item}
             </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
