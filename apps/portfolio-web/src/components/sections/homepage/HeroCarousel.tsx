/**
 * @file apps/portfolio-web/src/components/sections/homepage/HeroCarousel.tsx
 * @description Orquestador Cinemático de la Recepción (Fase 1: Awareness).
 *              Refactorizado: Motor de audio con protección de ciclo de vida,
 *              LCP Optimization (Fetch Priority), telemetría DNA-Level
 *              y normalización de rutas de activos S3.
 * @version 19.0 - Linter Pure & Next.js 15 Ready
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
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas - Nx Boundary Compliance)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../../config/i18n.config';
import type { HeroDictionary } from '../../../lib/schemas/hero.schema';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/**
 * @interface HeroCarouselProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface HeroCarouselProps {
  /** Diccionario maestro validado por SSoT */
  dictionary: HeroDictionary;
}

/** 
 * Función de limpieza estática para useSyncExternalStore 
 * @pilar X: Previene recreación de funciones en render.
 */
const noop = () => {};
const subscribe = () => noop;

/**
 * Hook de Hidratación de Élite (Pilar VIII)
 */
function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO PRINCIPAL: HeroCarousel
 * @description Motor sensorial de hospitalidad. Orquesta multimedia S3 con resiliencia.
 */
export function HeroCarousel({ dictionary }: HeroCarouselProps) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  
  // Referencias de Control de Infraestructura
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const mountTime = useRef<number>(0);
  
  // Estados de Interfaz
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loadedAssets, setLoadedAssets] = useState<Record<number, boolean>>({});

  /**
   * PROTOCOLO HEIMDALL: Inicialización de Nodo
   */
  useEffect(() => {
    mountTime.current = performance.now();
    console.log(`${C.magenta}${C.bold}[DNA][CINEMATIC]${C.reset} Hero Engine Synchronized.`);
  }, []);

  /**
   * RESOLVER SOBERANO DE ACTIVOS (S3 Normalization)
   * @description Sanea rutas y vincula con el bucket 'sanctuary-vault'.
   */
  const getAssetUrl = useCallback((path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    if (supabaseUrl && !path.startsWith('/')) {
        return `${supabaseUrl}/storage/v1/object/public/sanctuary-vault/${path}`;
    }
    
    return path.startsWith('/') ? path : `/${path}`;
  }, []);

  /**
   * RESOLUCIÓN LINGÜÍSTICA
   */
  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1] as Locale;
    return i18n.locales.includes(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  /**
   * MATRIZ NARRATIVA (SSoT Sync)
   */
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

  /**
   * ORQUESTADOR EMBLA (Motion Logic)
   */
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40, skipSnaps: false }, 
    [Fade(), Autoplay({ delay: 12000, stopOnInteraction: false })]
  );

  /**
   * MOTOR DE AUDIO: Fade Logic Blindada
   * @pilar X: Previene race conditions en el control de volumen.
   */
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;
    
    const audio = audioRef.current;
    let fadeInterval: NodeJS.Timeout | null = null;
    
    if (!isMuted) {
      audio.volume = 0;
      audio.play().catch(() => { 
        console.warn(`${C.yellow}[HEIMDALL][AUDIO] Autoplay blocked by policy.${C.reset}`); 
      });
      
      fadeInterval = setInterval(() => {
        if (audio.volume < 0.20) {
          audio.volume = Math.min(0.20, audio.volume + 0.02);
        } else {
          if (fadeInterval) clearInterval(fadeInterval);
        }
      }, 150);
    } else {
      audio.pause();
    }

    return () => {
      if (fadeInterval) clearInterval(fadeInterval);
    };
  }, [isMuted, isMounted]);

  /**
   * HANDLER: onSelect
   * Sincroniza la reproducción de videos con el viewport activo.
   */
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    
    console.log(`${C.cyan}   → [VIEWPORT]${C.reset} Active Slide: ${index} (${slides[index].id})`);
    
    videoRefs.current.forEach((v, i) => {
      if (i === index) v.play().catch(noop);
      else v.pause();
    });
  }, [emblaApi, slides]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  /**
   * LCP TELEMETRY: Stream Ready Signal
   */
  const handleCanPlayThrough = useCallback((index: number) => {
    setLoadedAssets(prev => {
      if (!prev[index]) {
        const loadTime = (performance.now() - mountTime.current).toFixed(2);
        console.log(`${C.green}   ✓ [LCP_READY]${C.reset} Stream [${index}] synchronized in ${loadTime}ms`);
      }
      return { ...prev, [index]: true };
    });
  }, []);

  if (!isMounted || !dictionary) return null;

  return (
    <section 
      className="relative h-[92vh] md:h-screen w-full bg-background overflow-hidden" 
      role="region" 
      aria-label="Experience Showcase"
    >
      {/* HUD DE CONTROL (Day-First / Surface Semantic) */}
      <div className="absolute top-32 right-8 z-50 flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "group flex items-center gap-4 rounded-full border p-4 backdrop-blur-2xl transition-all shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "bg-surface/80 border-border/50 text-foreground hover:border-primary/40",
            !isMuted && "text-primary border-primary/30"
          )}
          aria-label={isMuted ? "Activar audio ambiental" : "Silenciar audio"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
          {!isMuted && (
            <span className="pr-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
              {dictionary.audio_active_label}
            </span>
          )}
        </motion.button>
      </div>

      <audio ref={audioRef} src={slides[selectedIndex].assets.audio} loop />

      {/* MOTOR EMBLA (The Viewport) */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                {/* STACK VISUAL: LCP & FETCH PRIORITY */}
                <div className="absolute inset-0 z-0 overflow-hidden transform-gpu bg-black">
                  <Image
                    src={slide.assets.poster}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    // Next.js 15 optimized priority hint
                    {...(index === 0 ? { fetchPriority: 'high' } : {})}
                    className={cn(
                      "object-cover transition-opacity duration-1500",
                      loadedAssets[index] ? "opacity-0" : "opacity-100",
                      "brightness-[0.4]"
                    )}
                  />
                  
                  <video
                    ref={(el) => { if (el) videoRefs.current.set(index, el); }}
                    src={slide.assets.video}
                    poster={slide.assets.poster}
                    autoPlay={index === 0}
                    loop muted playsInline
                    onCanPlayThrough={() => handleCanPlayThrough(index)}
                    className={cn(
                      "h-full w-full object-cover transition-all duration-1500 transform-gpu",
                      // Filtro de brillo adaptativo para contraste WCAG
                      "brightness-[0.45] [data-theme='light']:brightness-[0.55]",
                      isActive ? "scale-105" : "scale-100",
                      loadedAssets[index] ? "opacity-100" : "opacity-0"
                    )}
                  />
                  
                  {/* Capas de atmósfera (Vignettes) */}
                  <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%) opacity-60" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent" />
                </div>

                {/* CAPA NARRATIVA (DNA Content) */}
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
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/20 text-[10px] font-bold text-white tracking-[0.5em] uppercase mb-10 backdrop-blur-xl shadow-lg">
                           <Sparkles size={14} className="text-primary animate-pulse" />
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
                          className="group relative inline-flex items-center gap-6 rounded-full px-12 py-6 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-3xl active:scale-95 bg-primary text-white hover:bg-white hover:text-black outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
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

      {/* NAVEGACIÓN (Pilar XII - Ergonómica) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-surface/60 backdrop-blur-3xl px-8 py-4 rounded-full border border-border/50 shadow-luxury">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { emblaApi?.scrollTo(i); }}
            className="group relative flex items-center justify-center p-2 outline-none"
            aria-label={`Ir al slide ${i + 1}`}
          >
            <div className={cn(
              "h-1.5 transition-all duration-1000 rounded-full",
              i === selectedIndex 
                ? "w-16 bg-primary shadow-[0_0_15px_var(--color-primary)]" 
                : "w-4 bg-muted-foreground/30 group-hover:bg-primary/40"
            )} />
          </button>
        ))}
      </div>
      
      {/* FOOTER SSSoT */}
      <div className="absolute bottom-4 right-8 opacity-20 pointer-events-none select-none">
         <span className="font-mono text-[7px] uppercase tracking-[0.5em] text-muted-foreground">
           Sovereign Infrastructure v19.0 • S3 Stream Node
         </span>
      </div>
    </section>
  );
}