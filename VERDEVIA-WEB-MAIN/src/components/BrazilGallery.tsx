'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

const images = [
  { src: "/assets/rio_de_janeiro.jpg", title: "Rio de Janeiro", location: "Sudeste", tone: "Risco costeiro" },
  { src: "/assets/amazon_forest.jpg", title: "Amazonas", location: "Norte", tone: "Proteção florestal" },
  { src: "/assets/salvador_bahia.jpg", title: "Salvador", location: "Nordeste", tone: "Patrimônio urbano" },
  { src: "/assets/iguazu_falls.jpg", title: "Foz do Iguaçu", location: "Sul", tone: "Monitoramento hídrico" },
  { src: "/assets/sao_paulo.jpg", title: "São Paulo", location: "Sudeste", tone: "Operação metropolitana" },
  { src: "/assets/pantanal.jpg", title: "Pantanal", location: "Centro-Oeste", tone: "Resposta ambiental" },
  { src: "/assets/brasilia.jpg", title: "Brasília", location: "Centro-Oeste", tone: "Governança pública" },
  { src: "/assets/lencois.jpg", title: "Lençóis Maranhenses", location: "Nordeste", tone: "Turismo sustentável" },
];

export const BrazilGallery = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);
  const plugins = React.useMemo(() => [Autoplay({ delay: 4200, stopOnInteraction: false })], []);

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
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,oklch(0.74_0.19_154_/_0.14),transparent_34%),radial-gradient(circle_at_82%_80%,oklch(0.68_0.16_205_/_0.12),transparent_38%)]" />
      <div className="container mx-auto px-6">
        <div className="relative z-10 mb-12 flex flex-col gap-8 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mb-4 text-4xl font-black uppercase italic tracking-tighter md:text-6xl">
              Brasil em <span className="text-primary text-glow">Foco</span>
            </h2>
            <p className="max-w-2xl text-lg italic text-muted-foreground">
              Nossa tecnologia de monitoramento alcança os lugares mais remotos e icônicos do país, garantindo segurança e transparência em escala nacional.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {images.map((img, index) => (
              <button
                key={img.title}
                type="button"
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${selected === index ? 'w-8 bg-primary' : 'w-2 bg-foreground/20 hover:bg-primary/50'}`}
                aria-label={`Ver ${img.title}`}
                aria-current={selected === index ? 'true' : undefined}
              />
            ))}
          </div>
        </div>

        <Carousel
          opts={{ align: 'start', loop: true }}
          setApi={setApi}
          plugins={plugins}
          className="relative z-10"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {images.map((img, i) => (
              <CarouselItem key={img.title} className="pl-4 md:basis-1/2 md:pl-6 xl:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.24) }}
                  viewport={{ once: true }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/15 bg-muted shadow-2xl shadow-emerald-950/10 md:aspect-[5/6]"
                >
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    <Image
                      src={img.src}
                      alt={img.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,19,15,0.06),rgba(4,19,15,0.28)_42%,rgba(4,19,15,0.86))] transition-opacity duration-500 group-hover:opacity-95" />
                  <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/18 to-transparent opacity-70" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/85 backdrop-blur-md">
                      {img.location}
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tight text-white md:text-4xl">
                      {img.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      {img.tone}
                    </p>
                  </div>

                  <div className="absolute inset-x-6 bottom-5 h-px origin-left scale-x-0 bg-gradient-to-r from-primary to-accent-foreground transition-transform duration-500 group-hover:scale-x-100" />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            className="left-3 z-20 h-11 w-11 bg-white/85 text-foreground md:-left-5"
            aria-label="Destino anterior"
          />
          <CarouselNext
            className="right-3 z-20 h-11 w-11 bg-white/85 text-foreground md:-right-5"
            aria-label="Próximo destino"
          />
        </Carousel>
      </div>
    </section>
  );
};
