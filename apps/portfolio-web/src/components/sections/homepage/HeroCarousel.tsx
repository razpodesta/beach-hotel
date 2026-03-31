/**
 * @file HeroCarousel.tsx
 * @description Orquestador Cinemático de la Recepción (Fase 1: Awareness).
 *              Refactorizado: Resolución de error de linter no-empty-function,
 *              blindaje de rutas multimedia y optimización de LCP.
 * @version 16.1 - Linter Pure & Cinematic Buffer Optimization
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
  dictionary: HeroDictionary;
}

/**
 * Hook de Hidratación de Élite (Pilar VIII)
 * @description Garantiza que el cliente está totalmente sincronizado antes de pintar multimedia.
 */
function useIsMounted(): boolean {
  /**
   * @fix: @typescript-eslint/no-empty-function
   * Se añade comentario descriptivo para satisfacer la regla de higiene del linter.
   */
  const subscribe = useCallback(() => {
    const noopUnsubscribe = () => {
      /* No-op: El estado de montaje es terminal y estático en el cliente */
    };
    return noopUnsubscribe;
  }, []);

  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: HeroCarousel
 * @description El motor sensorial del portal. Orquesta video, audio y narrativa.
 */
export function HeroCarousel({ dictionary }: HeroCarouselProps) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState<Record<number, boolean>>({});

  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1] as Locale;
    return i18n.locales.includes(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  /**
   * HELPER: resolveAsset
   * @description Garantiza que las rutas apunten a los subdirectorios correctos de /public.
   */
  const resolveAsset = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    if (path.endsWith('.mp4')) return `/video/${path}`;
    return `/images/hotel/${path}`;
  };

  /**
   * MATRIZ NARRATIVA (Sincronizada con MACS)
   */
  const slides = useMemo(() => [
    {
      id: 'hotel',
      title: dictionary.HOTEL_TITLE,
      subtitle: dictionary.HOTEL_SUBTITLE,
      features: dictionary.HOTEL_FEATURES,
      assets: {
        video: resolveAsset(dictionary.assets.hotel.video_url),
        poster: resolveAsset(dictionary.assets.hotel.poster_url),
        audio: resolveAsset(dictionary.assets.hotel.audio_url)
      },
      cta: '/quienes-somos'
    },
    {
      id: 'festival',
      title: dictionary.FESTIVAL_TITLE,
      subtitle: dictionary.FESTIVAL_SUBTITLE,
      features: dictionary.FESTIVAL_FEATURES,
      assets: {
        video: resolveAsset(dictionary.assets.festival.video_url),
        poster: resolveAsset(dictionary.assets.festival.poster_url),
        audio: resolveAsset(dictionary.assets.festival.audio_url)
      },
      cta: '/festival'
    }
  ], [dictionary]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 60, skipSnaps: false }, 
    [Fade(), Autoplay({ delay: 9000, stopOnInteraction: false })]
  );

  /**
   * MOTOR SENSORIAL: Audio Crossfade
   */
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;
    
    const audio = audioRef.current;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    if (!isMuted) {
      audio.volume = 0;
      audio.play().catch(() => console.warn('[HEIMDALL] Interaction required for audio.'));
      
      let vol = 0;
      fadeIntervalRef.current = setInterval(() => {
        if (vol < 0.20) {
          vol = Math.min(0.20, vol + 0.02);
          audio.volume = vol;
        } else {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, 100);
    } else {
      audio.pause();
    }

    return () => { if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current); };
  }, [isMuted, isMounted, selectedIndex]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    console.log(`[HEIMDALL][UX] Awareness_Focus: Slide[${index}] -> ${slides[index].id}`);
  }, [emblaApi, slides]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  if (!isMounted || !dictionary) return null;

  return (
    <section 
      className="relative h-[95vh] md:h-screen w-full bg-background overflow-hidden transition-colors duration-1000" 
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
            "group flex items-center gap-4 rounded-full border border-border/40 bg-surface/60 p-4 text-foreground backdrop-blur-2xl transition-all hover:bg-surface/80 shadow-luxury",
            !isMuted && "border-primary/50"
          )}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-primary animate-pulse" />}
          <AnimatePresence>
            {!isMuted && (
              <motion.span 
                initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                className="text-[9px] font-bold uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap"
              >
                {dictionary.audio_active_label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <audio ref={audioRef} src={slides[selectedIndex].assets.audio} loop />

      {/* 2. MOTOR CINEMÁTICO */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                {/* Visual Stack (LCP Optimized) */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950">
                  <Image
                    src={slide.assets.poster}
                    alt=""
                    fill
                    priority={index === 0}
                    className={cn(
                      "object-cover transition-opacity duration-1000",
                      videoLoaded[index] ? "opacity-0" : "opacity-100",
                      "brightness-[0.4] [data-theme='light']:brightness-[0.6]"
                    )}
                  />
                  {/* @pilar VIII: Resiliencia de carga de video */}
                  <video
                    src={slide.assets.video}
                    poster={slide.assets.poster}
                    autoPlay loop muted playsInline
                    onCanPlayThrough={() => setVideoLoaded(prev => ({ ...prev, [index]: true }))}
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-10000 ease-linear gpu-layer",
                      "brightness-[0.4] [data-theme='light']:brightness-[0.65]",
                      isActive ? "scale-110" : "scale-100",
                      videoLoaded[index] ? "opacity-100" : "opacity-0"
                    )}
                  />
                  
                  <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,var(--color-background)_100%) opacity-60" />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
                </div>

                {/* Narrative Layer */}
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
                          className="group relative inline-flex items-center gap-6 rounded-full px-12 py-6 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-luxury active:scale-95 bg-foreground text-background hover:bg-primary hover:text-white"
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

      {/* 3. NAVEGACIÓN */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-surface/40 backdrop-blur-md px-6 py-3 rounded-full border border-border/20 shadow-luxury transition-colors duration-1000">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="group relative p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
          >
            <div className={cn(
              "h-1 transition-all duration-700 rounded-full",
              i === selectedIndex ? "w-12 bg-foreground" : "w-4 bg-foreground/20 group-hover:bg-foreground/40"
            )} />
          </button>
        ))}
      </div>
    </section>
  );
}