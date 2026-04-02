/**
 * @file HeroCarousel.tsx
 * @description Orquestador Cinemático de la Recepción (Fase 1: Awareness).
 *              Refactorizado: Purificación total de funciones vacías (no-empty-function),
 *              resolución de retornos de efectos (TS7030) y optimización Supabase Storage.
 * @version 17.2 - Flawless Linter & React 19 Standard
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
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
 * @pilar_V: Adherencia arquitectónica.
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
  const subscribe = useCallback(() => {
    /** 
     * @fix: no-empty-function 
     * Se añade 'void 0' para declarar una intención de no-operación explícita.
     */
    return () => { void 0; };
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
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loadedAssets, setLoadedAssets] = useState<Record<number, boolean>>({});

  /**
   * RESOLVER SOBERANO DE ACTIVOS (Supabase Sync)
   * @description Mapea rutas lógicas a URLs físicas del bucket 'sanctuary-vault'.
   */
  const getAssetUrl = useCallback((path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !path.startsWith('/')) {
        return `${supabaseUrl}/storage/v1/object/public/sanctuary-vault/${path}`;
    }
    
    return path.startsWith('/') ? path : `/${path}`;
  }, []);

  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1] as Locale;
    return i18n.locales.includes(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  const slides = useMemo(() => [
    {
      id: 'hotel',
      title: dictionary.HOTEL_TITLE,
      subtitle: dictionary.HOTEL_SUBTITLE,
      features: dictionary.HOTEL_FEATURES,
      assets: {
        video: getAssetUrl(dictionary.assets.hotel.video_url),
        poster: getAssetUrl(dictionary.assets.hotel.poster_url),
        audio: getAssetUrl(dictionary.assets.hotel.audio_url)
      },
      cta: '/quienes-somos'
    },
    {
      id: 'festival',
      title: dictionary.FESTIVAL_TITLE,
      subtitle: dictionary.FESTIVAL_SUBTITLE,
      features: dictionary.FESTIVAL_FEATURES,
      assets: {
        video: getAssetUrl(dictionary.assets.festival.video_url),
        poster: getAssetUrl(dictionary.assets.festival.poster_url),
        audio: getAssetUrl(dictionary.assets.festival.audio_url)
      },
      cta: '/festival'
    }
  ], [dictionary, getAssetUrl]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30, skipSnaps: false }, 
    [Fade(), Autoplay({ delay: 10000, stopOnInteraction: false })]
  );

  /**
   * MOTOR DE AUDIO: Fade-In / Fade-Out
   * @fix TS7030: Garantiza que todas las rutas de ejecución devuelvan una función de limpieza.
   */
  useEffect(() => {
    if (!isMounted || !audioRef.current) return () => { void 0; };
    
    const audio = audioRef.current;
    let fadeTimer: NodeJS.Timeout | undefined;
    
    if (!isMuted) {
      audio.volume = 0;
      audio.play().catch(() => { 
        console.warn('[HEIMDALL] Interaction required for audio.'); 
      });
      
      fadeTimer = setInterval(() => {
        if (audio.volume < 0.25) {
          audio.volume = Math.min(0.25, audio.volume + 0.05);
        } else {
          if (fadeTimer) clearInterval(fadeTimer);
        }
      }, 200);
    } else {
      audio.pause();
    }

    return () => {
      if (fadeTimer) clearInterval(fadeTimer);
    };
  }, [isMuted, isMounted]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    
    /** @pilar_IV: Heimdall Telemetry */
    console.log(`[HEIMDALL][UX] Cinematic_Focus: Slide[${index}] | Asset: ${slides[index].id}`);
    
    // Gestión de reproducción sincronizada con el viewport activo
    Object.values(videoRefs.current).forEach((v, i) => {
      if (i === index) {
        v?.play().catch(() => { void 0; });
      } else {
        v?.pause();
      }
    });
  }, [emblaApi, slides]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  if (!isMounted || !dictionary) return null;

  return (
    <section 
      className="relative h-[92vh] md:h-screen w-full bg-zinc-950 overflow-hidden" 
      role="region" 
      aria-label="Experience Showcase"
    >
      {/* 1. INTERFAZ DE CONTROL (HUD) */}
      <div className="absolute top-32 right-8 z-50 flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "group flex items-center gap-4 rounded-full border border-white/10 bg-black/40 p-4 text-white backdrop-blur-2xl transition-all hover:bg-black/60 shadow-2xl",
            !isMuted && "border-primary/50"
          )}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="text-primary animate-pulse" />}
          {!isMuted && (
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] pr-2">
              {dictionary.audio_active_label}
            </span>
          )}
        </motion.button>
      </div>

      <audio ref={audioRef} src={slides[selectedIndex].assets.audio} loop />

      {/* 2. MOTOR DE RENDERIZADO (Embla Viewport) */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                {/* Visual Stack (LCP Optimized) */}
                <div className="absolute inset-0 z-0 overflow-hidden transform-gpu">
                  <Image
                    src={slide.assets.poster}
                    alt=""
                    fill
                    priority={index === 0}
                    className={cn(
                      "object-cover transition-opacity duration-1000",
                      loadedAssets[index] ? "opacity-0" : "opacity-100",
                      "brightness-[0.4]"
                    )}
                  />
                  
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    src={slide.assets.video}
                    poster={slide.assets.poster}
                    autoPlay={index === 0}
                    loop muted playsInline
                    onCanPlayThrough={() => {
                      setLoadedAssets(prev => ({ ...prev, [index]: true }));
                    }}
                    className={cn(
                      "h-full w-full object-cover transition-all duration-1000 transform-gpu",
                      "brightness-[0.5] [data-theme='light']:brightness-[0.7]",
                      isActive ? "scale-105" : "scale-100",
                      loadedAssets[index] ? "opacity-100" : "opacity-0"
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
                        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-6xl"
                      >
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-primary tracking-[0.5em] uppercase mb-10 backdrop-blur-xl">
                           <Sparkles size={14} className="animate-pulse" />
                           {slide.features}
                        </div>
                        
                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter leading-[0.8] mb-12 uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                          {slide.title}
                        </h1>
                        
                        <p className="font-sans text-xl md:text-3xl text-white/80 max-w-2xl mb-16 leading-relaxed font-light italic">
                          {slide.subtitle}
                        </p>

                        <Link 
                          href={getLocalizedHref(slide.cta, currentLang)}
                          className="group relative inline-flex items-center gap-6 rounded-full px-12 py-6 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-3xl active:scale-95 bg-primary text-white hover:bg-white hover:text-black"
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
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-black/20 backdrop-blur-xl px-8 py-4 rounded-full border border-white/5 shadow-luxury">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { emblaApi?.scrollTo(i); }}
            className="group relative flex items-center justify-center p-2 outline-none"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className={cn(
              "h-1.5 transition-all duration-1000 rounded-full",
              i === selectedIndex ? "w-16 bg-primary shadow-[0_0_15px_var(--color-primary)]" : "w-4 bg-white/20 group-hover:bg-white/40"
            )} />
          </button>
        ))}
      </div>
      
      <div className="absolute bottom-4 right-8 opacity-10 pointer-events-none select-none">
         <span className="text-[7px] font-mono text-white uppercase tracking-[0.5em]">Supabase Asset Stream v17.2</span>
      </div>
    </section>
  );
}