/**
 * @file HeroCarousel.tsx
 * @description Orquestador Cinemático de la Recepción (Fase 1: Awareness).
 *              Refactorizado: Sincronización Day-First, optimización de React 19,
 *              trazabilidad Heimdall y UX de alta fidelidad.
 * @version 15.0 - Atmosphere Master & LCP Optimized
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
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../../config/i18n.config';
import type { HeroDictionary } from '../../../lib/schemas/hero.schema';

/**
 * @interface HeroCarouselProps
 */
interface HeroCarouselProps {
  /** Diccionario validado por el contrato soberano v2.0 */
  dictionary: HeroDictionary;
}

/**
 * Hook de Hidratación de Élite (Pilar VIII)
 * @description Garantiza que el cliente está totalmente sincronizado antes de pintar multimedia.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => { /* No-op: Estado terminal */ };
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: HeroCarousel
 * @description El motor sensorial del portal. Adapta su intensidad lumínica a la atmósfera global.
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
   * MATRIZ NARRATIVA (Sincronizada con MACS Assets)
   */
  const slides = useMemo(() => [
    {
      id: 'hotel',
      title: dictionary.HOTEL_TITLE,
      subtitle: dictionary.HOTEL_SUBTITLE,
      features: dictionary.HOTEL_FEATURES,
      assets: dictionary.assets.hotel,
      cta: '/quienes-somos'
    },
    {
      id: 'festival',
      title: dictionary.FESTIVAL_TITLE,
      subtitle: dictionary.FESTIVAL_SUBTITLE,
      features: dictionary.FESTIVAL_FEATURES,
      assets: dictionary.assets.festival,
      cta: '/festival'
    }
  ], [dictionary]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 60, skipSnaps: false }, 
    [Fade(), Autoplay({ delay: 9000, stopOnInteraction: false })]
  );

  /**
   * MOTOR SENSORIAL: Audio Crossfade (Pilar XII)
   * Implementa una transición suave para no romper la atmósfera boutique.
   */
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;
    
    const traceId = `audio_sync_${Date.now()}`;
    const audio = audioRef.current;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    console.group(`[HEIMDALL][SENSORY] Audio Management: ${traceId}`);

    if (!isMuted) {
      console.log(`Status: Engaging Ambient Audio - Slide: ${slides[selectedIndex].id}`);
      audio.volume = 0;
      audio.play().catch(() => {
        console.warn('Playback: Interaction required by browser policy.');
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
      console.log('Status: Sensory Silence Engaged.');
      audio.pause();
    }

    console.groupEnd();

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isMuted, isMounted, selectedIndex, slides]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    // Trazabilidad forense de Awareness
    console.log(`[HEIMDALL][UX] Awareness_Sync: Slide[${index}] -> ${slides[index].id}`);
  }, [emblaApi, slides]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  if (!isMounted || !dictionary) return null;

  return (
    <section 
      /**
       * @pilar VII: Theming Soberano
       * Sustituimos bg-black por bg-background para paridad Day-First.
       */
      className="relative h-[95vh] md:h-screen w-full bg-background overflow-hidden transition-colors duration-1000" 
      role="region" 
      aria-label={dictionary.page_title}
    >
      {/* 1. CONTROL SENSORIAL (Thumb-Driven UX) */}
      <div className="absolute top-32 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "group flex items-center gap-4 rounded-full border border-border/40 bg-surface/60 p-4 text-foreground backdrop-blur-2xl transition-all hover:bg-surface/80 shadow-2xl",
            !isMuted && "border-primary/50 shadow-primary/10"
          )}
          aria-label={isMuted ? dictionary.audio_active_label : dictionary.audio_muted_label}
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
                {dictionary.audio_active_label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <audio ref={audioRef} src={slides[selectedIndex].assets.audio_url} loop />

      {/* 2. MOTOR CINEMÁTICO */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                {/* Visual Stack (LCP Optimized) */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={slide.assets.poster_url}
                    alt=""
                    fill
                    priority={index === 0}
                    className={cn(
                      "object-cover transition-opacity duration-1000",
                      isActive ? "opacity-100" : "opacity-0",
                      "brightness-[0.4] [data-theme='dark']:brightness-[0.3]"
                    )}
                  />
                  <video
                    src={slide.assets.video_url}
                    poster={slide.assets.poster_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-10000 ease-linear transform-gpu",
                      "brightness-[0.4] [data-theme='dark']:brightness-[0.35]",
                      isActive ? "scale-110" : "scale-100"
                    )}
                  />
                  
                  {/* Atmosphere Overlay Adaptativo (Pilar XII) */}
                  <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,var(--color-background)_100%) opacity-60" />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
                </div>

                {/* Narrative Layer (Atmosphere Aware) */}
                <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6 lg:px-12">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(12px)' }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-5xl"
                      >
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-surface/20 border border-white/10 text-[10px] font-bold text-white tracking-[0.5em] uppercase mb-10 backdrop-blur-xl">
                           <Sparkles size={14} className="text-primary" />
                           {slide.features}
                        </div>
                        
                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter leading-[0.8] mb-12 uppercase drop-shadow-2xl">
                          {slide.title}
                        </h1>
                        
                        <p className="font-sans text-xl md:text-3xl text-white/80 max-w-2xl mb-16 leading-relaxed font-light italic">
                          {slide.subtitle}
                        </p>

                        <Link 
                          href={getLocalizedHref(slide.cta, currentLang)}
                          className={cn(
                            "group relative inline-flex items-center gap-6 rounded-full px-12 py-6 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-3xl active:scale-95",
                            "bg-foreground text-background hover:bg-primary hover:text-white"
                          )}
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

      {/* 3. NAVEGACIÓN (Atmosphere Controlled) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-surface/40 backdrop-blur-md px-6 py-3 rounded-full border border-border/20 shadow-2xl transition-colors duration-1000">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="group relative p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full transition-all"
            aria-label={`Ir para slide ${i + 1}`}
          >
            <div className={cn(
              "h-1 transition-all duration-700 rounded-full",
              i === selectedIndex 
                ? "w-12 bg-foreground" 
                : "w-4 bg-foreground/20 group-hover:bg-foreground/40"
            )} />
          </button>
        ))}
      </div>
    </section>
  );
}