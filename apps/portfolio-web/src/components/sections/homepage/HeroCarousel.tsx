/**
 * @file HeroCarousel.tsx
 * @description Orquestador cinematográfico de la sección Hero. 
 *              Nivelado: Clean-up de eventos, tipado estricto y sin errores de linter.
 * @version 9.3 - Linter Compliant & Hook Integrity
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';
import NextLink from 'next/link';

import { cn } from '../../../lib/utils/cn';
import type { HeroDictionary } from '../../../lib/schemas/hero.schema';

interface SlideConfig {
  id: string;
  titleKey: keyof HeroDictionary;
  subtitleKey: keyof HeroDictionary;
  featuresKey: keyof HeroDictionary;
  videoUrl: string;
  posterUrl: string;
  ctaLink: string;
}

/**
 * @pilar X: Rendimiento. Detecta montaje para evitar discrepancias entre servidor y cliente.
 */
const useIsMounted = () => useSyncExternalStore(
  () => () => { /* Suscripción estática para hidratación */ }, 
  () => true, 
  () => false
);

export function HeroCarousel({ dictionary }: { dictionary: HeroDictionary | undefined }) {
  const isMounted = useIsMounted();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const slides = useMemo<SlideConfig[]>(() => [
    {
      id: 'luxury-sanctuary',
      titleKey: 'HOTEL_TITLE',
      subtitleKey: 'HOTEL_SUBTITLE',
      featuresKey: 'HOTEL_FEATURES',
      videoUrl: "https://cdn.pixabay.com/video/2021/09/01/87113-596486047_large.mp4",
      posterUrl: "/images/hotel/hero-hotel-poster.jpg",
      ctaLink: "/quienes-somos"
    },
    {
      id: 'pride-takeover',
      titleKey: 'FESTIVAL_TITLE',
      subtitleKey: 'FESTIVAL_SUBTITLE',
      featuresKey: 'FESTIVAL_FEATURES',
      videoUrl: "https://cdn.pixabay.com/video/2023/10/24/186358-877995180_large.mp4",
      posterUrl: "/images/festival/hero-festival-poster.jpg",
      ctaLink: "/festival"
    }
  ], []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 50 }, 
    [Fade(), Autoplay({ delay: 8000, stopOnInteraction: false })]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  if (!dictionary || !isMounted) return null;

  return (
    <section className="relative h-screen w-full bg-[#020202] overflow-hidden" role="region">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-28 right-8 z-50 rounded-full border border-white/10 bg-black/40 p-4 text-white backdrop-blur-2xl hover:bg-white/20 transition-all active:scale-90"
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? <VolumeX size={20} strokeWidth={1.5} /> : <Volume2 size={20} strokeWidth={1.5} />}
      </button>

      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
              <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                  src={slide.videoUrl}
                  poster={slide.posterUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className={cn(
                    "h-full w-full object-cover brightness-[0.4] transition-transform duration-1000",
                    index === selectedIndex ? "scale-110" : "scale-100"
                  )}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#020202] via-transparent to-black/30" />
              </div>

              <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6 md:px-12">
                <AnimatePresence mode="wait">
                  {index === selectedIndex && (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="max-w-5xl"
                    >
                      <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 tracking-[0.4em] uppercase mb-8 backdrop-blur-xl">
                        <Sparkles size={12} className="text-purple-400 animate-pulse" />
                        {dictionary[slide.featuresKey]}
                      </div>
                      
                      <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter leading-[0.85] mb-10 uppercase">
                        {dictionary[slide.titleKey]}
                      </h1>
                      
                      <p className="font-sans text-lg md:text-2xl text-zinc-400 max-w-2xl mb-12 leading-relaxed font-light italic">
                        {dictionary[slide.subtitleKey]}
                      </p>

                      <NextLink 
                        href={slide.ctaLink}
                        className="group relative inline-flex items-center gap-6 rounded-full bg-white px-12 py-5 text-[10px] font-bold text-black uppercase tracking-[0.3em] transition-all hover:bg-purple-600 hover:text-white shadow-3xl active:scale-95"
                      >
                        {dictionary.CTA_BUTTON}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                      </NextLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}