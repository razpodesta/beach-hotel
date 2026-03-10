/**
 * @file BlogSection3D - Concierge Journal 3D Stack.
 * @version 8.0 - MetaShark Elite Standard
 * @description Carrusel editorial interactivo con profundidad 3D. 
 *              Optimizado para rendimiento WebGL simulado con Framer Motion y alias soberanos.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ALIAS SOBERANOS (@/* mapea a apps/portfolio-web/src/*)
import { cn } from '@/lib/utils/cn';
import { BlurText } from '@/components/razBits/BlurText';
import type { PostWithSlug } from '@/lib/schemas/blog.schema';
import type { Dictionary } from '@/lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 5000;

interface BlogSection3DProps {
  posts: PostWithSlug[];
  dictionary: Dictionary['blog_page'];
  lang: string;
}

/**
 * Aparato de Visualización Editorial 3D.
 * Implementa un carrusel tipo "Stack" con transformaciones de perspectiva.
 */
export function BlogSection3D({ posts, dictionary, lang }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Memoización defensiva de los posts (limitado a los 5 más recientes para performance)
  const displayPosts = useMemo(() => 
    (posts || []).slice(0, 5), 
  [posts]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  // Soporte para navegación nativa por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isPaused]);

  // Orquestador de Autoplay
  useEffect(() => {
    if (isPaused || displayPosts.length <= 1) return;
    const timer = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused, displayPosts.length]);

  // Fail-safe de renderizado
  if (displayPosts.length === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#020202] py-24 border-y border-white/5" 
      aria-label="Concierge Journal"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. HEADER EDITORIAL */}
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

      {/* 2. STACK CONTAINER (3D Simulation) */}
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

            // Solo renderizamos las 3 tarjetas visibles para optimizar el DOM
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
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1] // Easing fluido de élite
                }}
                className={cn(
                  "absolute w-[280px] sm:w-[320px] md:w-[380px] aspect-[3/4] rounded-[2.5rem] border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl transition-shadow duration-500",
                  isActive ? "cursor-default shadow-purple-500/10" : "cursor-pointer hover:border-white/20"
                )}
                onClick={() => !isActive && (isNext ? handleNext() : handlePrev())}
                aria-hidden={!isActive}
              >
                {/* Imagen del Artículo con Priority en el Active */}
                <Image
                  src={`/images/blog/${post.slug}.jpg`}
                  alt={post.metadata.title}
                  fill
                  className="object-cover brightness-75 transition-transform duration-1000 hover:scale-110"
                  sizes="(max-width: 768px) 280px, 380px"
                  priority={isActive}
                />
                
                {/* Overlay de Contenido */}
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

      {/* 3. CONTROLES DE NAVEGACIÓN */}
      <div className="flex justify-center items-center gap-10 mt-20">
        <button 
          onClick={handlePrev} 
          aria-label="Previous Article"
          className="p-5 rounded-full border border-white/5 text-white bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>

        {/* Indicador de Posición */}
        <div className="flex gap-2">
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
          className="p-5 rounded-full border border-white/5 text-white bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
        >
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}