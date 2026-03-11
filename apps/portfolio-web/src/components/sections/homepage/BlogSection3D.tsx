/**
 * @file apps/portfolio-web/src/components/sections/homepage/BlogSection3D.tsx
 * @description Aparato de visualización editorial con profundidad interactiva (3D Stack). 
 *              Implementa orquestación de animaciones físicas mediante Framer Motion,
 *              soporte de teclado y cumplimiento estricto de fronteras arquitectónicas.
 * @version 9.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento @nx/enforce-module-boundaries)
 */
import { cn } from '../../../lib/utils/cn';
import { BlurText } from '../../razBits/BlurText';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 5000;

interface BlogSection3DProps {
  /** Colección de artículos provenientes del CMS */
  posts: PostWithSlug[];
  /** Diccionario localizado para la sección de blog */
  dictionary: Dictionary['blog_page'];
  /** Contexto de idioma para la construcción de rutas */
  lang: string;
}

/**
 * Aparato Visual: BlogSection3D
 * Gestiona el carrusel interactivo "The Concierge Journal".
 */
export function BlogSection3D({ posts, dictionary, lang }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * MEMOIZACIÓN ESTRATÉGICA:
   * Limitamos a los 5 posts más recientes para optimizar el peso del DOM en dispositivos móviles.
   */
  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  /**
   * ACCESIBILIDAD NATIVA:
   * Control por teclado sincronizado con el ciclo de vida del componente.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isPaused]);

  /**
   * ORQUESTADOR DE AUTOPLAY:
   * Implementa una pausa inteligente al detectar interacción del usuario.
   */
  useEffect(() => {
    if (isPaused || displayPosts.length <= 1) return;
    const timer = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused, displayPosts.length]);

  // Guardia de renderizado: Previene flashes si no hay datos.
  if (displayPosts.length === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#020202] py-24 border-y border-white/5" 
      aria-label="The Concierge Journal Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. ENCABEZADO EDITORIAL */}
      <div className="container mx-auto px-6 mb-20 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 text-purple-500">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">
            Concierge Journal
          </span>
        </div>
        <BlurText 
          text={dictionary.featured_title.toUpperCase()} 
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold justify-center tracking-tighter text-white" 
        />
      </div>

      {/* 2. CONTENEDOR DE PERSPECTIVA (3D STACK) */}
      <div 
        className="relative h-[520px] w-full flex items-center justify-center perspective-1000"
        role="region"
        aria-roledescription="carousel"
      >
        <AnimatePresence mode="popLayout">
          {displayPosts.map((post, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + displayPosts.length) % displayPosts.length;
            const isNext = index === (activeIndex + 1) % displayPosts.length;

            // Optimizamos el renderizado manteniendo solo el trío activo en el DOM.
            if (!isActive && !isPrev && !isNext) return null;

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, scale: 0.8, x: isNext ? 300 : -300 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.35, 
                  scale: isActive ? 1 : 0.85, 
                  x: isActive ? 0 : isNext ? 280 : -280,
                  zIndex: isActive ? 30 : 10,
                  rotateY: isActive ? 0 : isNext ? -25 : 25,
                  filter: isActive ? 'blur(0px)' : 'blur(4px)'
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className={cn(
                  "absolute w-[280px] sm:w-[320px] md:w-[380px] aspect-3/4 rounded-[2.5rem] border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl transition-shadow duration-500",
                  isActive ? "cursor-default shadow-purple-500/10" : "cursor-pointer hover:border-white/20"
                )}
                onClick={() => !isActive && (isNext ? handleNext() : handlePrev())}
                aria-hidden={!isActive}
              >
                {/* Visual Hook: Imagen de portada */}
                <Image
                  src={`/images/blog/${post.slug}.jpg`}
                  alt={post.metadata.title}
                  fill
                  className="object-cover brightness-75 transition-transform duration-1000 hover:scale-110"
                  sizes="(max-width: 768px) 280px, 380px"
                  priority={isActive}
                />
                
                {/* Narrative Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                   <AnimatePresence>
                     {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-3 block">
                          {post.metadata.tags[0] || 'Exclusive'}
                        </span>
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-6 leading-tight tracking-tight">
                          {post.metadata.title}
                        </h3>
                        <Link 
                          href={`/${lang}/blog/${post.slug}`} 
                          className="group/btn inline-flex items-center gap-3 text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:text-purple-400 transition-colors"
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

      {/* 3. CONTROLES DE NAVEGACIÓN (Touch & Click Optimized) */}
      <div className="flex justify-center items-center gap-10 mt-20">
        <button 
          onClick={handlePrev} 
          aria-label="Previous Article"
          className="p-5 rounded-full border border-white/5 text-white bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>

        <div className="flex gap-2" aria-hidden="true">
          {displayPosts.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 transition-all duration-500 rounded-full",
                i === activeIndex ? "w-8 bg-purple-500" : "w-2 bg-zinc-800"
              )}
            />
          ))}
        </div>

        <button 
          onClick={handleNext} 
          aria-label="Next Article"
          className="p-5 rounded-full border border-white/5 text-white bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}