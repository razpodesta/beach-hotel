/**
 * @file BlogSection3D.tsx
 * @description Orquestador de visualización editorial con profundidad interactiva (3D Stack).
 *              Fase 7 del Embudo: Autoridad y Legado Narrativo.
 *              Nivelado para cumplimiento del React Compiler y 'verbatimModuleSyntax'.
 * @version 16.0 - React Compiler Sync & Granular Memoization
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica mediante rutas relativas internas.
 */
import { BlurText } from '../../razBits/BlurText.js';
import { BlogCard3D } from '../../ui/BlogCard3D.js';
import { cn } from '../../../lib/utils/cn.js';

/**
 * IMPORTACIONES DE CONTRATO (Solo Tipos)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
import type { PostWithSlug } from '../../../lib/schemas/blog.schema.js';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema.js';

const AUTOPLAY_INTERVAL = 8000;

interface BlogSection3DProps {
  /** Colección de artículos saneada por el Orquestador de Datos (Fachada) */
  posts: PostWithSlug[];
  /** Diccionario nivelado tras el Protocolo MACS */
  dictionary: Dictionary['blog_page'];
  /** Contexto de idioma para formateo y rumbos */
  lang: string;
  className?: string;
}

/**
 * APARATO: BlogSection3D
 * @description Presenta los artículos más relevantes en un carrusel cinemático con profundidad física.
 */
export function BlogSection3D({ posts, dictionary, lang, className }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * @pilar II: Cero Regresiones - Desestructuración defensiva.
   * Al extraer la propiedad hero_title aquí, creamos una referencia estable que resuelve
   * el error 'preserve-manual-memoization' de ESLint.
   */
  const { hero_title, featured_title, read_more_cta } = dictionary || {};

  /**
   * @pilar X: Rendimiento de Élite. 
   * Limitamos el stack visual para optimizar el consumo de memoria de la GPU.
   */
  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);

  /**
   * RESOLUCIÓN DE ETIQUETA DE CONTEXTO
   * @fix Resolución del error de memoización manual mediante dependencia en referencia extraída.
   */
  const contextTag = useMemo(() => {
    if (!hero_title) return 'Sanctuary';
    const parts = hero_title.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : 'Sanctuary';
  }, [hero_title]);

  const handleNext = useCallback(() => {
    if (displayPosts.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    if (displayPosts.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Interacción
   * @pilar IV: Trazabilidad del foco editorial.
   */
  useEffect(() => {
    if (displayPosts.length > 0 && displayPosts[activeIndex]) {
      console.log(`[HEIMDALL][UX] Editorial_Orbit_Focus: ${displayPosts[activeIndex].slug}`);
    }
  }, [activeIndex, displayPosts]);

  /**
   * MOTOR DE AUTOPLAY RESILIENTE
   */
  useEffect(() => {
    if (isPaused || displayPosts.length <= 1) return;
    const timer = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused, displayPosts.length]);

  /**
   * @pilar VIII: GUARDIA DE RESILIENCIA
   * Los retornos tempranos se realizan ÚNICAMENTE después de declarar todos los hooks.
   */
  if (!posts || displayPosts.length === 0 || !dictionary) return null;

  return (
    <section 
      className={cn(
        "relative w-full overflow-hidden bg-[#020202] py-24 sm:py-40 border-y border-white/5",
        className
      )} 
      aria-label={hero_title}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* CAPA ATMOSFÉRICA (Luxury Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.04),transparent_70%)] pointer-events-none" />

      {/* HEADER NARRATIVO */}
      <div className="container mx-auto px-6 mb-20 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8 text-purple-500"
        >
          <Sparkles size={16} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.6em] text-zinc-500 uppercase font-mono">
            {hero_title}
          </span>
        </motion.div>
        
        <BlurText 
          text={featured_title?.toUpperCase() || ''} 
          className="text-4xl md:text-8xl font-display font-bold justify-center tracking-tighter text-white drop-shadow-2xl" 
          animateBy="letters"
        />
      </div>

      {/* CARRETE 3D (Core Engine) */}
      <div 
        className="relative h-[550px] md:h-[650px] w-full flex items-center justify-center perspective-2000"
        role="region"
        aria-roledescription="carousel"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {displayPosts.map((post, index) => {
            const isActive = index === activeIndex;
            if (!isActive) return null;

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, scale: 0.8, x: 150, rotateY: 35, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, x: -150, rotateY: -35, filter: 'blur(10px)' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="z-20 transform-gpu"
              >
                <BlogCard3D 
                   post={post} 
                   lang={lang} 
                   ctaText={read_more_cta || ''} 
                   tagLabel={contextTag}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* CONTROLES TÁCTICOS (Thumb-Driven UX) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 sm:px-12 pointer-events-none z-30">
          <button 
            onClick={handlePrev} 
            className="group p-6 sm:p-8 rounded-full border border-white/10 bg-black/60 text-white pointer-events-auto backdrop-blur-2xl transition-all hover:bg-purple-600 hover:border-purple-400 active:scale-90 shadow-2xl"
            aria-label="Artigo Anterior"
          >
            <ChevronLeft size={28} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={handleNext} 
            className="group p-6 sm:p-8 rounded-full border border-white/10 bg-black/60 text-white pointer-events-auto backdrop-blur-2xl transition-all hover:bg-purple-600 hover:border-purple-400 active:scale-90 shadow-2xl"
            aria-label="Próximo Artigo"
          >
            <ChevronRight size={28} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* INDICADORES DE PROGRESO */}
      <div className="flex justify-center items-center gap-4 mt-16">
        {displayPosts.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setActiveIndex(i)}
            className="group p-2 outline-none"
            aria-label={`Ir para slide ${i + 1}`}
          >
            <motion.div 
              animate={{ 
                width: i === activeIndex ? 48 : 12,
                backgroundColor: i === activeIndex ? '#a855f7' : '#3f3f46'
              }}
              className="h-1.5 rounded-full transition-colors group-hover:bg-zinc-500"
            />
          </button>
        ))}
      </div>
    </section>
  );
}