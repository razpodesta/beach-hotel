/**
 * @file apps/portfolio-web/src/components/sections/homepage/HeroCarousel.tsx
 * @description Orquestador inmersivo de la sección Hero. Implementa un carrusel 
 *              de video/audio de alto rendimiento con gestión de estados 
 *              físicos y tipado estricto sincronizado con Zod.
 * @version 7.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import NextLink from 'next/link';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento Nx)
 */
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * Contrato de Slide: Sincronizado con las claves de hero.schema.ts.
 * Resolvemos los errores TS7053 y TS2551 asegurando que las claves existan en el SSoT.
 */
type HeroContent = Dictionary['homepage']['hero'];

interface Slide {
  id: string;
  /** Clave del título en el esquema (Mapeado a arquetipos existentes) */
  titleKey: keyof HeroContent;
  /** Clave del subtítulo en el esquema */
  subtitleKey: keyof HeroContent;
  /** Clave de información técnica/precio en el esquema */
  priceKey: keyof HeroContent;
  videoUrl: string;
  posterUrl: string;
  ctaLink: string;
}

/**
 * Definición de Slides de Hospitalidad.
 * Nota: Utilizamos las claves canónicas del esquema (HOTELS y FASHION como proxy de Festival)
 * para garantizar la seguridad de tipos sin romper el contrato de Zod.
 */
const SLIDES: Slide[] = [
  {
    id: 'luxury-suite',
    titleKey: 'HOTELS_TITLE',
    subtitleKey: 'HOTELS_SUBTITLE',
    priceKey: 'HOTELS_FEATURES',
    videoUrl: "https://cdn.pixabay.com/video/2021/09/01/87113-596486047_large.mp4",
    posterUrl: "/images/hotel/suite-luxury-poster.jpg",
    ctaLink: "/#suites"
  },
  {
    id: 'pride-festival',
    titleKey: 'FASHION_TITLE', // Mapeado a FASHION por disponibilidad en el esquema
    subtitleKey: 'FASHION_SUBTITLE',
    priceKey: 'FASHION_FEATURES',
    videoUrl: "https://cdn.pixabay.com/video/2023/10/24/186358-877995180_large.mp4",
    posterUrl: "/images/festival/pride-poster.jpg",
    ctaLink: "/festival"
  }
];

interface HeroCarouselProps {
  /** Diccionario de la sección hero inyectado por el orquestador de página */
  dictionary: HeroContent;
}

/**
 * Aparato de UI: HeroCarousel
 * Implementa una experiencia cinematográfica con control de audio boutique.
 */
export function HeroCarousel({ dictionary }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 }, 
    [Fade(), Autoplay({ delay: 9000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section 
      className="relative h-screen w-full bg-[#020202] overflow-hidden"
      aria-label="Presentación inmersiva del hotel"
    >
      {/* 
         CONTROL DE AUDIO:
         Efecto visual boutique con desenfoque de fondo (backdrop-blur).
      */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-28 right-8 z-50 rounded-full border border-white/10 bg-black/20 p-4 text-white backdrop-blur-xl hover:bg-white/20 transition-all active:scale-90"
        aria-label={isMuted ? "Activar sonido" : "Desactivar sonido"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide, index) => {
            const isActive = index === selectedIndex;
            
            return (
              <div className="relative flex-[0_0_100%] h-full min-w-0" key={slide.id}>
                
                {/* CAPA DE MEDIOS (Video Layer) */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <video
                    src={slide.videoUrl}
                    poster={slide.posterUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="h-full w-full object-cover brightness-[0.5] scale-105"
                    // Optimización de carga: El primer slide se carga con prioridad
                    preload={index === 0 ? "auto" : "none"}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#020202] via-transparent to-black/20" />
                </div>

                {/* CAPA DE CONTENIDO (Narrative Layer) */}
                <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-8 md:px-16">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-4xl"
                      >
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white tracking-[0.4em] uppercase mb-10 backdrop-blur-md">
                           <Sparkles size={12} className="text-purple-400" />
                           {dictionary[slide.priceKey]}
                        </div>
                        
                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter leading-[0.85] mb-10 uppercase">
                          {dictionary[slide.titleKey]}
                        </h1>
                        
                        <p className="font-sans text-lg md:text-2xl text-zinc-400 max-w-2xl mb-12 leading-relaxed font-light">
                          {dictionary[slide.subtitleKey]}
                        </p>

                        <NextLink 
                          href={slide.ctaLink}
                          className="group relative inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-[10px] font-bold text-black uppercase tracking-[0.3em] hover:bg-purple-600 hover:text-white transition-all shadow-2xl"
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

      {/* INDICADORES DE NAVEGACIÓN (Boutique Dots) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
         {SLIDES.map((_, i) => (
           <div 
             key={i} 
             className={`h-1 transition-all duration-500 rounded-full ${i === selectedIndex ? 'w-12 bg-white' : 'w-3 bg-white/20'}`} 
           />
         ))}
      </div>
    </section>
  );
}