/**
 * @file BlogSection3D.tsx
 * @description Orquestador de visualización editorial con profundidad interactiva.
 *              Refactorizado: 100% Data-Driven, Sincronización con Shaper v14.0 y SEO/A11Y.
 * @version 13.0 - High-Fidelity i18n Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import { BlurText } from '../../razBits/BlurText';
import { BlogCard3D } from '../../ui/BlogCard3D';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 7000; // Aumentado ligeramente para mejorar la legibilidad del usuario

interface BlogSection3DProps {
  /** Colección de artículos saneada por el Orquestador de Datos */
  posts: PostWithSlug[];
  /** Diccionario de la página de blog validado por SSoT */
  dictionary: Dictionary['blog_page'];
  /** Idioma actual para formateo interno */
  lang: string;
}

export function BlogSection3D({ posts, dictionary, lang }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * @pilar X: Rendimiento de Élite. 
   * Limitamos el stack 3D a 5 elementos para optimizar el consumo de GPU.
   */
  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Interacción
   */
  useEffect(() => {
    if (displayPosts.length > 0) {
      console.log(`[HEIMDALL][UX] Blog_Slide_Focus: ${displayPosts[activeIndex].slug}`);
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

  // @pilar VIII: Guardia de Resiliencia ante datos nulos
  if (displayPosts.length === 0 || !dictionary) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#020202] py-24 sm:py-32 border-y border-white/5" 
      aria-label={dictionary.hero_title}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* CAPA ATMOSFÉRICA */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-6 mb-20 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 text-purple-500"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.5em] text-zinc-500 uppercase font-mono">
            {dictionary.hero_title}
          </span>
        </motion.div>
        
        <BlurText 
          text={dictionary.featured_title.toUpperCase()} 
          className="text-4xl md:text-7xl font-display font-bold justify-center tracking-tighter text-white" 
        />
      </div>

      {/* CARRETE 3D (STACK ANIMATION) */}
      <div 
        className="relative h-[550px] w-full flex items-center justify-center perspective-1000"
        role="region"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {displayPosts.map((post, index) => {
            const isActive = index === activeIndex;
            if (!isActive) return null;

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, scale: 0.8, x: 100, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, scale: 1.1, x: -100, rotateY: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="z-20"
              >
                <BlogCard3D 
                   post={post} 
                   lang={lang} 
                   ctaText={dictionary.read_more_cta} 
                   /** Inyectamos la etiqueta "Sanctuary" desde el diccionario */
                   tagLabel={dictionary.hero_title.split(' ')[1]}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* CONTROLES TÁCTICOS (Thumb-Driven UX) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-10 pointer-events-none z-30">
          <button 
            onClick={handlePrev} 
            className="p-4 sm:p-6 rounded-full border border-white/5 bg-black/40 text-white pointer-events-auto backdrop-blur-xl hover:bg-purple-600 transition-all active:scale-90"
            aria-label="Previous Article"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={handleNext} 
            className="p-4 sm:p-6 rounded-full border border-white/5 bg-black/40 text-white pointer-events-auto backdrop-blur-xl hover:bg-purple-600 transition-all active:scale-90"
            aria-label="Next Article"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* INDICADORES DE PROGRESO */}
      <div className="flex justify-center items-center gap-3 mt-12">
        {displayPosts.map((_, i) => (
          <motion.div 
            key={i} 
            animate={{ 
              width: i === activeIndex ? 40 : 8,
              backgroundColor: i === activeIndex ? '#a855f7' : '#27272a'
            }}
            className="h-1 rounded-full cursor-pointer"
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}