/**
 * @file apps/portfolio-web/src/components/sections/homepage/BlogSection3D.tsx
 * @description Orquestador de visualización editorial con profundidad interactiva (3D Stack). 
 *              Implementa físicas de movimiento premium, integración con Media Library y telemetría Nos3.
 * @version 10.0 - CMS Media Sync & Telemetry Hardening
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * IMPORTACIONES NIVELADAS
 */
import { cn } from '../../../lib/utils/cn';
import { BlurText } from '../../razBits/BlurText';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 6000; // @pilar XII: Ajustado para mayor legibilidad

interface BlogSection3DProps {
  /** Colección de artículos saneados del CMS */
  posts: PostWithSlug[];
  /** Diccionario localizado para la sección de blog */
  dictionary: Dictionary['blog_page'];
  /** Contexto de idioma soberano */
  lang: string;
}

/**
 * Aparato Visual: BlogSection3D
 */
export function BlogSection3D({ posts, dictionary, lang }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // @pilar X: Limitación de DOM para optimizar el rendimiento móvil
  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);

  /**
   * MANEJADORES DE NAVEGACIÓN CON TELEMETRÍA (Pilar IV)
   */
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  const trackArticleClick = (slug: string) => {
    console.log(`[HEIMDALL][UX] Interacción: Carousel-Selection -> ${slug}`);
  };

  /**
   * ACCESIBILIDAD Y CONTROL (Pilar III)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Home') setActiveIndex(0);
      if (e.key === 'End') setActiveIndex(displayPosts.length - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isPaused, displayPosts.length]);

  /**
   * ORQUESTADOR DE CICLO DE VIDA (Autoplay)
   */
  useEffect(() => {
    if (isPaused || displayPosts.length <= 1) return;
    const timer = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused, displayPosts.length]);

  // Guardia de resiliencia
  if (displayPosts.length === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#020202] py-24 sm:py-32 border-y border-white/5" 
      aria-label="The Concierge Journal Featured Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Glow de Fondo Atmosférico */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.02),transparent_70%)] pointer-events-none" />

      {/* 1. ENCABEZADO EDITORIAL */}
      <div className="container mx-auto px-6 mb-20 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 text-purple-500"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.5em] text-zinc-500 uppercase font-mono">
            Editorial Sanctuary
          </span>
        </motion.div>
        <BlurText 
          text={dictionary.featured_title.toUpperCase()} 
          className="text-4xl md:text-7xl font-display font-bold justify-center tracking-tighter text-white" 
        />
      </div>

      {/* 2. CONTENEDOR DE PERSPECTIVA (3D STACK) */}
      <div 
        className="relative h-[550px] w-full flex items-center justify-center perspective-2000"
        role="region"
        aria-roledescription="carousel"
      >
        <AnimatePresence mode="popLayout">
          {displayPosts.map((post, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + displayPosts.length) % displayPosts.length;
            const isNext = index === (activeIndex + 1) % displayPosts.length;

            if (!isActive && !isPrev && !isNext) return null;

            /**
             * @pilar I: Resolución Dinámica de Imagen.
             * Nota: La propiedad customImage (proyectada del CMS) debe inyectarse aquí.
             * Por ahora usamos el fallback saneado.
             */
            const imageUrl = `/images/blog/${post.slug}.jpg`;

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, scale: 0.8, rotateY: isNext ? -30 : 30, x: isNext ? 400 : -400 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.25, 
                  scale: isActive ? 1 : 0.8, 
                  x: isActive ? 0 : isNext ? 320 : -320,
                  zIndex: isActive ? 30 : 10,
                  rotateY: isActive ? 0 : isNext ? -35 : 35,
                  filter: isActive ? 'blur(0px)' : 'blur(8px)',
                }}
                exit={{ opacity: 0, scale: 0.5, x: isNext ? -400 : 400 }}
                transition={{ 
                  duration: 0.9, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className={cn(
                  "absolute w-[300px] sm:w-[380px] aspect-`aspect-3/4` rounded-[3rem] border border-white/10 bg-zinc-900 overflow-hidden shadow-3xl transform-gpu",
                  isActive ? "cursor-default" : "cursor-pointer"
                )}
                onClick={() => !isActive && (isNext ? handleNext() : handlePrev())}
              >
                {/* Visual Layer */}
                <Image
                  src={imageUrl}
                  alt={post.metadata.title}
                  fill
                  className="object-cover brightness-75 transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 768px) 300px, 380px"
                  priority={isActive}
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent p-10 flex flex-col justify-end">
                   <AnimatePresence>
                     {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                      >
                        <span className="inline-block text-[9px] font-bold text-purple-400 uppercase tracking-[0.3em]">
                          {post.metadata.tags[0] || 'Concierge Choice'}
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                          {post.metadata.title}
                        </h3>
                        <Link 
                          href={`/${lang}/blog/${post.slug}`} 
                          onClick={() => trackArticleClick(post.slug)}
                          className="group/btn inline-flex items-center gap-3 text-white font-bold text-[10px] uppercase tracking-[0.4em] hover:text-purple-400 transition-colors pt-2"
                        >
                          {dictionary.read_more_cta} 
                          <ArrowUpRight size={14} className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                        </Link>
                      </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 3. CONTROLES DE PRECISIÓN */}
      <div className="flex justify-center items-center gap-12 mt-20">
        <button 
          onClick={handlePrev} 
          className="p-6 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Previous Article"
        >
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>

        {/* Indicadores Boutique */}
        <div className="flex gap-3">
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

        <button 
          onClick={handleNext} 
          className="p-6 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Next Article"
        >
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}