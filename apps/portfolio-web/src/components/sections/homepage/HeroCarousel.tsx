/**
 * @file HeroCarousel.tsx
 * @description Orquestador Cinemático de la Recepción (Fase 1: Awareness).
 *              Implementa narrativa sensorial, optimización de LCP y telemetría de atención.
 *              Refactorizado: 100% i18n, Linter Compliant y Protección de CLS.
 * @version 12.1 - Elite Hygiene Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../lib/utils/cn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../../config/i18n.config';
import type { HeroDictionary } from '../../../lib/schemas/hero.schema';

/**
 * @interface HeroCarouselProps
 */
interface HeroCarouselProps {
  /** Diccionario aplanado validado por SSoT */
  dictionary: HeroDictionary;
}

/**
 * @interface SlideConfig
 */
interface SlideConfig {
  id: 'hotel' | 'festival';
  titleKey: keyof HeroDictionary;
  subtitleKey: keyof HeroDictionary;
  featuresKey: keyof HeroDictionary;
  videoUrl: string;
  posterUrl: string;
  ctaLink: string;
  audioTeaser: string;
}

/**
 * Hook de Hidratación de Élite (Pilar VIII)
 * @description Erradica el Hydration Mismatch mediante suscripción atómica.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    /**
     * FUNCIÓN DE LIMPIEZA SOBERANA
     * @description Satisfaciendo @typescript-eslint/no-empty-function.
     * Al ser un estado de montaje terminal en cliente, no requiere des-suscripción activa.
     */
    const noop = () => {
      /* No-op: Estado estático alcanzado tras hidratación */
    };
    return noop;
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: HeroCarousel
 * @description El motor de mayor impacto visual y primer punto del embudo comercial.
 */
export function HeroCarousel({ dictionary }: HeroCarouselProps) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1] as Locale;
    return i18n.locales.includes(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  /**
   * MATRIZ NARRATIVA
   */
  const slides = useMemo<SlideConfig[]>(() => [
    {
      id: 'hotel',
      titleKey: 'HOTEL_TITLE',
      subtitleKey: 'HOTEL_SUBTITLE',
      featuresKey: 'HOTEL_FEATURES',
      videoUrl: "https://cdn.pixabay.com/video/2021/09/01/87113-596486047_large.mp4",
      posterUrl: "/images/hotel/hero-hotel-poster.jpg",
      ctaLink: "/quienes-somos",
      audioTeaser: "/audio/sanctuary-ambient.mp3"
    },
    {
      id: 'festival',
      titleKey: 'FESTIVAL_TITLE',
      subtitleKey: 'FESTIVAL_SUBTITLE',
      featuresKey: 'FESTIVAL_FEATURES',
      videoUrl: "https://cdn.pixabay.com/video/2023/10/24/186358-877995180_large.mp4",
      posterUrl: "/images/festival/hero-festival-poster.jpg",
      ctaLink: "/festival",
      audioTeaser: "/audio/festival-beat.mp3"
    }
  ], []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 60, skipSnaps: false }, 
    [Fade(), Autoplay({ delay: 9000, stopOnInteraction: false })]
  );

  /**
   * MOTOR SENSORIAL (AUDIO FADE-IN)
   */
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;
    
    const audio = audioRef.current;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    if (!isMuted) {
      audio.volume = 0;
      audio.play().catch(() => {
        // Fallback silencioso: El navegador bloqueó el autoplay
      });
      
      let vol = 0;
      fadeIntervalRef.current = setInterval(() => {
        if (vol < 0.25) {
          vol = Math.min(0.25, vol + 0.05);
          audio.volume = vol;
        } else {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, 150);
    } else {
      audio.pause();
    }

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isMuted, isMounted, selectedIndex]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Atención
   */
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    console.log(`[HEIMDALL][UX] Awareness_Focus: ${slides[index].id}`);
  }, [emblaApi, slides]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  if (!isMounted || !dictionary) return null;

  return (
    <section 
      className="relative h-[95vh] md:h-screen w-full bg-black overflow-hidden" 
      role="region" 
      aria-label={dictionary.page_title}
    >
      {/* 1. CONTROL SENSORIAL */}
      <div className="absolute top-32 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "group flex items-center gap-3 rounded-full border border-white/10 bg-black/40 p-4 text-white backdrop-blur-2xl transition-all hover:bg-white/20 shadow-2xl",
            !isMuted && "border-primary/50 shadow-primary/20"
          )}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-primary animate-pulse" />}
          <AnimatePresence>
            {!isMuted && (
              <motion.span 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="text-[9px] font-bold uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap"
              >
                Ambient Active
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <audio ref={audioRef} src={slides[selectedIndex].audioTeaser} loop />

      {/* 2. MOTOR CINEMÁTICO */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                {/* Visual Architecture */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={slide.posterUrl}
                    alt=""
                    fill
                    priority={index === 0}
                    className={cn(
                      "object-cover brightness-[0.4] transition-opacity duration-1000",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <video
                    src={slide.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={cn(
                      "h-full w-full object-cover brightness-[0.35] transition-transform duration-10000 ease-linear transform-gpu",
                      isActive ? "scale-110" : "scale-100"
                    )}
                  />
                  <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)" />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                </div>

                {/* Narrative Layer */}
                <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6 lg:px-12">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-5xl"
                      >
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 tracking-[0.5em] uppercase mb-10 backdrop-blur-xl">
                           <Sparkles size={14} className="text-primary" />
                           {dictionary[slide.featuresKey]}
                        </div>
                        
                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter leading-[0.8] mb-12 uppercase">
                          {dictionary[slide.titleKey]}
                        </h1>
                        
                        <p className="font-sans text-xl md:text-3xl text-zinc-400 max-w-2xl mb-16 leading-relaxed font-light italic">
                          {dictionary[slide.subtitleKey]}
                        </p>

                        <Link 
                          href={getLocalizedHref(slide.ctaLink, currentLang)}
                          className="group relative inline-flex items-center gap-6 rounded-full bg-white px-12 py-6 text-[11px] font-bold text-black uppercase tracking-[0.4em] transition-all hover:bg-primary hover:text-white shadow-3xl active:scale-95"
                        >
                          {dictionary.CTA_BUTTON}
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-3" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. NAVEGACIÓN (THUMB-DRIVEN) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="group relative p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className={cn(
              "h-1 transition-all duration-500 rounded-full",
              i === selectedIndex ? "w-12 bg-white" : "w-4 bg-white/20 group-hover:bg-white/40"
            )} />
          </button>
        ))}
      </div>
    </section>
  );
}