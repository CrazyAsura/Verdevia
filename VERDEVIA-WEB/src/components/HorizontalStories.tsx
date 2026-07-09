'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const stories = [
  { city: "Manaus", action: "Monitoramento Ambiental", result: "20% Redução Incêndios", img: "/assets/amazon_forest.jpg" },
  { city: "Rio de Janeiro", action: "Segurança Comunitária", result: "Resposta em < 10min", img: "/assets/rio_de_janeiro.jpg" },
  { city: "Brasília", action: "Fiscalização Pública", result: "Transparência 100%", img: "/assets/brasilia.jpg" },
  { city: "Aracaju", action: "Manutenção Urbana", result: "Orla 100% Iluminada", img: "/assets/aracaju.jpg" },
];

export function HorizontalStories() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section 
      ref={targetRef} 
      className={isMobile ? "relative bg-background py-24 overflow-hidden" : "relative h-[400vh] bg-background"}
    >
      <div
        className={isMobile ? "relative flex flex-col px-6" : "sticky top-0 h-screen flex flex-col items-center justify-center gap-8 overflow-hidden py-10"}
      >
        <div className={isMobile ? "w-full mb-12" : "container mx-auto px-6"}>
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
           >
             <h2 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black uppercase italic tracking-tighter leading-none">
               Histórias de <br />
               <span className="text-primary text-glow">Impacto Brasil</span>
             </h2>
           </motion.div>
        </div>
        
        <motion.div 
          style={isMobile ? {} : { x }} 
          className={isMobile ? "flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-none w-screen" : "flex gap-12 px-6"}
        >
          {stories.map((story, i) => (
            <div 
              key={i} 
              className={isMobile 
                ? "relative h-[450px] w-72 shrink-0 snap-center group cursor-pointer overflow-hidden rounded-2xl border border-white/5" 
                : "relative h-[58vh] max-h-[600px] w-72 shrink-0 group cursor-pointer overflow-hidden rounded-2xl border border-white/5"
              }
            >
                <Image 
                  src={story.img} 
                  fill
                  className="object-cover transition-transform duration-1500 group-hover:scale-125" 
                  alt={story.city} 
                  sizes="288px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 sm:bottom-12 sm:left-12 sm:right-12 z-20">
                    <motion.div
                      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="text-primary font-black uppercase tracking-[0.5em] text-[9px] sm:text-[10px] mb-2 sm:mb-4 block">
                        {story.city}
                      </span>
                      <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter mb-3 sm:mb-4 leading-tight">
                        {story.action}
                      </h3>
                      <div className="h-1 w-12 bg-primary mb-4 sm:mb-6 transition-all duration-500 group-hover:w-full" />
                      <p className="text-muted-foreground italic text-sm sm:text-lg font-medium">
                        {story.result}
                      </p>
                    </motion.div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-12 h-12 rounded-full border border-primary/50 flex items-center justify-center text-primary text-xs font-black">
                    {i + 1}
                  </div>
                </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
