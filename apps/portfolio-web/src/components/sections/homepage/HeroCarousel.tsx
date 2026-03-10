// RUTA: apps/portfolio-web/src/components/sections/homepage/HeroCarousel.tsx
// VERSIÓN: 6.0 - Hospitality 2026 Edition
// DESCRIPCIÓN: Hero inmersivo de alto rendimiento. Acceso tipado a diccionarios
//              y optimización de carga para Core Web Vitals.

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import NextLink from 'next/link';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

// Tipado estricto para los slides
type Slide = {
  id: string;
  titleKey: 'SUITES_TITLE' | 'FESTIVAL_TITLE';
  subtitleKey: 'SUITES_SUBTITLE' | 'FESTIVAL_SUBTITLE';
  priceKey: 'price_info' | 'ticket_info';
  videoUrl: string;
  posterUrl: string;
  ctaLink: string;
};

const SLIDES: Slide[] = [
  {
    id: 'luxury-suite',
    titleKey: 'SUITES_TITLE',
    subtitleKey: 'SUITES_SUBTITLE',
    priceKey: 'price_info',
    videoUrl: "https://cdn.pixabay.com/video/2021/09/01/87113-596486047_large.mp4",
    posterUrl: "/images/hotel/suite-luxury-poster.jpg",
    ctaLink: "/#suites"
  },
  {
    id: 'pride-festival',
    titleKey: 'FESTIVAL_TITLE',
    subtitleKey: 'FESTIVAL_SUBTITLE',
    priceKey: 'ticket_info',
    videoUrl: "https://cdn.pixabay.com/video/2023/10/24/186358-877995180_large.mp4",
    posterUrl: "/images/festival/pride-poster.jpg",
    ctaLink: "/festival"
  }
];

export function HeroCarousel({ dictionary }: { dictionary: Dictionary['homepage']['hero'] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Fade(), Autoplay({ delay: 9000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative h-screen w-full bg-[#020202] overflow-hidden">
      
      {/* Botón de Audio Minimalista */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-28 right-6 z-50 rounded-full border border-white/10 bg-white/5 p-3 text-white backdrop-blur-md hover:bg-white/20 transition-all"
        aria-label="Toggle Mute"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                
                {/* Media Layer: Priorizamos carga del primer elemento para el LCP */}
                <div className="absolute inset-0 z-0">
                  <video
                    src={slide.videoUrl}
                    poster={slide.posterUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    className="h-full w-full object-cover brightness-[0.6]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#020202] via-transparent to-transparent/40" />
                </div>

                {/* Content Layer */}
                <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6 md:px-12">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white tracking-[0.3em] uppercase mb-8 backdrop-blur-sm">
                           <Sparkles size={10} className="text-purple-400" />
                           {dictionary[slide.priceKey]}
                        </div>
                        
                        <h1 className="font-display text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-8 uppercase">
                          {dictionary[slide.titleKey]}
                        </h1>
                        
                        <p className="font-sans text-lg md:text-xl text-zinc-400 max-w-xl mb-12">
                          {dictionary[slide.subtitleKey]}
                        </p>

                        <NextLink 
                          href={slide.ctaLink}
                          className="group relative inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-xs font-bold text-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                          {dictionary.CTA_BUTTON}
                        </NextLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}