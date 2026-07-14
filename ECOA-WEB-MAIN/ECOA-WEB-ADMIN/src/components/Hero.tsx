'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  { 
    img: "/assets/rio_de_janeiro.jpg", 
    tag: "Sudeste", 
    title: "Rio de Janeiro",
    desc: "Relatos comunitários, evidências verificadas e equipes conectadas para proteger espaços públicos de alto fluxo."
  },
  { 
    img: "/assets/amazon_forest.jpg", 
    tag: "Norte", 
    title: "Amazônia Viva",
    desc: "Inteligência territorial para identificar riscos ambientais, priorizar ocorrências e dar visibilidade ao que precisa de resposta."
  },
  { 
    img: "/assets/salvador_bahia.jpg", 
    tag: "Nordeste", 
    title: "Cultura e História",
    desc: "Comunidades, prestadores e gestores operando com o mesmo mapa de evidências para cuidar do patrimônio urbano."
  },
  { 
    img: "/assets/iguazu_falls.jpg", 
    tag: "Sul", 
    title: "Foz do Iguaçu",
    desc: "Dados geolocalizados ajudam a antecipar impactos, coordenar atendimento e medir resultado com transparência."
  }
];

export const Hero = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);
  const plugins = React.useMemo(() => [Autoplay({ delay: 6500, stopOnInteraction: false })], []);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Carousel 
        opts={{ loop: true }}
        setApi={setApi}
        plugins={plugins}
        className="w-full h-full"
      >
        <CarouselContent className="h-screen m-0 border-none">
          {slides.map((slide, i) => (
            <CarouselItem key={i} className="relative h-screen p-0 border-none shrink-0 group">
              {/* Background */}
              <motion.div 
                className="absolute inset-0 duration-8000 transition-transform group-hover:scale-110"
              >
                <Image
                  src={slide.img}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                />
              </motion.div>
              {/* Overlays */}
              <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(5,28,22,0.82),rgba(5,28,22,0.45)_42%,rgba(7,21,34,0.78))] z-10" />
              <div className="absolute inset-0 bg-linear-to-b from-black/45 via-transparent to-black/75 z-10" />
              
              {/* Content */}
              <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
                 <motion.div
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8, delay: 0.2 }}
                 >
                     <span className="px-4 py-1.5 border border-primary/30 rounded-full text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] bg-primary/10 mb-4 sm:mb-8 inline-block shadow-[0_0_15px_-5px_#10B981]">
                       {slide.tag}
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black italic uppercase tracking-tighter mb-4 sm:mb-8 leading-[0.9] sm:leading-[0.8] drop-shadow-2xl">
                       {slide.title.split(' ')[0]} <br /> 
                       <span className="bg-gradient-to-r from-primary via-lime-300 to-accent-foreground bg-clip-text text-transparent font-black">{slide.title.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="max-w-md sm:max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base md:text-lg italic px-4 sm:px-0 mb-6 sm:mb-12 opacity-80 font-medium leading-relaxed">
                       {slide.desc}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full px-8 sm:px-0">
                       <Link href="/baixar" className="w-full sm:w-auto">
                          <Button size="lg" className="w-full sm:w-auto h-12 sm:h-16 px-6 sm:px-12 text-xs sm:text-sm font-black uppercase tracking-widest bg-gradient-to-r from-primary via-emerald-500 to-accent-foreground hover:brightness-110 text-primary-foreground glow-green rounded-none border-none">
                             Baixar Aplicativo
                          </Button>
                       </Link>
                       <Link href="/sobre" className="w-full sm:w-auto">
                          <Button size="lg" variant="ghost" className="w-full sm:w-auto h-12 sm:h-16 px-6 sm:px-12 text-xs sm:text-sm font-black uppercase tracking-widest hover:text-primary group border border-transparent hover:border-primary/20">
                             Missão Brasil <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </Button>
                       </Link>
                    </div>
                 </motion.div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 z-30 hidden h-12 w-12 border-white/25 bg-white/10 text-white hover:bg-primary hover:text-primary-foreground md:inline-flex xl:left-10" />
        <CarouselNext className="right-4 z-30 hidden h-12 w-12 border-white/25 bg-white/10 text-white hover:bg-primary hover:text-primary-foreground md:inline-flex xl:right-10" />
      </Carousel>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-size-[40px_40px] bg-[radial-gradient(circle_at_center,rgba(32,201,151,0.15)_1px,transparent_1px)]" />
      
      {/* Slide Indicators Teaser */}
      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/20 px-4 py-3 text-white shadow-2xl backdrop-blur-md">
         {slides.map((slide, index) => (
           <button
             key={slide.title}
             type="button"
             onClick={() => api?.scrollTo(index)}
             className="group flex items-center gap-2"
             aria-label={`Ir para ${slide.title}`}
             aria-current={selected === index ? 'true' : undefined}
           >
             <span className={`h-1.5 rounded-full transition-all duration-300 ${selected === index ? 'w-9 bg-primary' : 'w-1.5 bg-white/40 group-hover:bg-white/70'}`} />
             <span className={`hidden text-[10px] font-black uppercase tracking-widest transition-colors sm:inline ${selected === index ? 'text-primary' : 'text-white/50 group-hover:text-white/80'}`}>
               {String(index + 1).padStart(2, '0')}
             </span>
           </button>
         ))}
      </div>
    </section>
  );
};
