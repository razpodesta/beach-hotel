/**
 * @file apps/portfolio-web/src/components/sections/homepage/HeroCarousel.tsx
 * @description Orquestador Cinemático de la Recepción (LCP Engine). 
 *              Implementa narrativa sensorial de audio, optimización de video y 
 *              telemetría forense de atención. 
 *              Refactorizado: Sincronización con el esquema aplanado MACS v1.0.
 * @version 11.0 - Cinematic Resilience & MACS Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante fronteras Nx.
 */
import { cn } from '../../../lib/utils/cn';
import { getLocalizedHref } from '../../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../../config/i18n.config';
import type { HeroDictionary } from '../../../lib/schemas/hero.schema';

/**
 * @interface HeroCarouselProps
 * @description Contrato explícito para la inyección de contenido localizado.
 */
interface HeroCarouselProps {
  /** Diccionario aplanado validado por SSoT */
  dictionary: HeroDictionary;
}

/**
 * @interface SlideConfig
 * @description Estructura técnica de cada unidad narrativa en el carrusel.
 */
interface SlideConfig {
  id: string;
  titleKey: keyof HeroDictionary;
  subtitleKey: keyof HeroDictionary;
  featuresKey: keyof HeroDictionary;
  videoUrl: string;
  posterUrl: string;
  ctaLink: string;
  audioTeaser: string;
}

/**
 * Hook de Hidratación de Élite
 * @pilar VIII: Erradica el parpadeo visual entre SSR y Cliente.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => () => { /* No-op teardown */ }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO PRINCIPAL: HeroCarousel
 * @description Gestiona la experiencia inmersiva inicial del Santuario.
 */
export function HeroCarousel({ dictionary }: HeroCarouselProps) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  /**
   * RESOLUCIÓN DE IDIOMA SOBERANA
   */
  const currentLang = useMemo(() => {
    const segments = pathname?.split('/') ?? [];
    const candidate = segments[1] as Locale;
    return i18n.locales.includes(candidate) ? candidate : i18n.defaultLocale;
  }, [pathname]);

  /**
   * CONFIGURACIÓN DE NARRATIVAS (DIMENSIONES)
   * Sincroniza los activos visuales con las llaves del diccionario.
   */
  const slides = useMemo<SlideConfig[]>(() => [
    {
      id: 'luxury-sanctuary',
      titleKey: 'HOTEL_TITLE',
      subtitleKey: 'HOTEL_SUBTITLE',
      featuresKey: 'HOTEL_FEATURES',
      videoUrl: "https://cdn.pixabay.com/video/2021/09/01/87113-596486047_large.mp4",
      posterUrl: "/images/hotel/hero-hotel-poster.jpg",
      ctaLink: "/quienes-somos",
      audioTeaser: "/audio/sanctuary-ambient.mp3"
    },
    {
      id: 'pride-takeover',
      titleKey: 'FESTIVAL_TITLE',
      subtitleKey: 'FESTIVAL_SUBTITLE',
      featuresKey: 'FESTIVAL_FEATURES',
      videoUrl: "https://cdn.pixabay.com/video/2023/10/24/186358-877995180_large.mp4",
      posterUrl: "/images/festival/hero-festival-poster.jpg",
      ctaLink: "/festival",
      audioTeaser: "/audio/festival-beat.mp3"
    }
  ], []);

  // Inicialización de Motor de Carrusel (Embla)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 60, skipSnaps: false }, 
    [Fade(), Autoplay({ delay: 9000, stopOnInteraction: false })]
  );

  /**
   * MOTOR DE AUDIO BOUTIQUE
   * @description Implementa un fundido de entrada (fade-in) para una experiencia de lujo.
   */
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;
    
    let intervalId: NodeJS.Timeout;

    if (!isMuted) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => 
        console.warn("[HEIMDALL][AUDIO] Autoplay restringido por política de navegador.")
      );
      
      let vol = 0;
      intervalId = setInterval(() => {
        if (vol < 0.25) {
          vol += 0.05;
          if (audioRef.current) audioRef.current.volume = vol;
        } else {
          clearInterval(intervalId);
        }
      }, 200);
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMuted, isMounted, selectedIndex]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Atención
   */
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      console.log(`[HEIMDALL][UX] Hero_Slide_Focus: ${slides[index].id}`);
    };

    emblaApi.on('select', onSelect);
    // @pilar X: Limpieza estricta de eventos
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, slides]);

  // @pilar VIII: Guardia ante datos inexistentes (Build Safety)
  if (!dictionary || !isMounted) return null;

  return (
    <section 
      className="relative h-[95vh] md:h-screen w-full bg-black overflow-hidden" 
      role="region" 
      aria-label="Luxury Welcome"
    >
      {/* 1. CONTROL DE ATMÓSFERA SENSORIAL */}
      <div className="absolute top-32 right-8 z-50">
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "group flex items-center gap-3 rounded-full border border-white/10 bg-black/40 p-4 text-white backdrop-blur-2xl transition-all hover:bg-white/20 active:scale-90 shadow-2xl",
            !isMuted && "border-purple-500/50"
          )}
          aria-label={isMuted ? "Activar atmósfera" : "Silenciar"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-purple-400" />}
          <AnimatePresence>
            {!isMuted && (
              <motion.span 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="text-[9px] font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap"
              >
                Audio Active
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <audio ref={audioRef} src={slides[selectedIndex].audioTeaser} loop />

      {/* 2. MOTOR DE RENDERIZADO DE SLIDES */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                {/* Capa Visual: Video de Élite */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <video
                    src={slide.videoUrl}
                    poster={slide.posterUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={cn(
                      "h-full w-full object-cover brightness-[0.35] transition-transform duration-10000 ease-linear",
                      isActive ? "scale-115" : "scale-100"
                    )}
                  />
                  {/* Gradientes de Inmersión Soberanos */}
                  <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)" />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                </div>

                {/* Capa Narrativa: Contenido MEA/UX */}
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
                          <div className="relative">
                            <Sparkles size={14} className="text-purple-400" />
                            <div className="absolute inset-0 bg-purple-400 blur-sm animate-pulse" />
                          </div>
                          {dictionary[slide.featuresKey]}
                        </div>
                        
                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter leading-[0.8] mb-12 uppercase">
                          {dictionary[slide.titleKey]}
                        </h1>
                        
                        <p className="font-sans text-xl md:text-3xl text-zinc-400 max-w-2xl mb-16 leading-relaxed font-light italic">
                          {dictionary[slide.subtitleKey]}
                        </p>

                        <div className="flex flex-wrap gap-6">
                          <Link 
                            href={getLocalizedHref(slide.ctaLink, currentLang)}
                            onClick={() => console.log(`[HEIMDALL][CONVERSION] Intent: ${slide.id}`)}
                            className="group relative inline-flex items-center gap-6 rounded-full bg-white px-12 py-6 text-[11px] font-bold text-black uppercase tracking-[0.4em] transition-all hover:bg-purple-600 hover:text-white shadow-[0_20px_50px_rgba(168,85,247,0.3)] active:scale-95"
                          >
                            {dictionary.CTA_BUTTON}
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-3" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. INDICADORES DE NAVEGACIÓN TÁCTICA (Thumb-Driven) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="group relative p-2 outline-none"
            aria-label={`Navegar a diapositiva ${i + 1}`}
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