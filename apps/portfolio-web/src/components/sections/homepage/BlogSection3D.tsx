/**
 * @file apps/portfolio-web/src/components/sections/homepage/BlogSection3D.tsx
 * @description Orquestador de visualización editorial con profundidad interactiva.
 *              Implementa orquestación de la Media Library, inercia de física
 *              y blindaje de hidratación.
 * @version 12.0 - Hydration-Safe & Optimized
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Pilar V)
 */
import { cn } from '../../../lib/utils/cn';
import { BlurText } from '../../razBits/BlurText';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 6000;

interface BlogSection3DProps {
  posts: PostWithSlug[];
  dictionary: Dictionary['blog_page'] | undefined;
  lang: string;
}

export function BlogSection3D({ posts, dictionary, lang }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // @pilar X: Rendimiento. Máximo 5 elementos en el stack.
  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  // Protocolo Heimdall: Trazabilidad forense de UX
  useEffect(() => {
    if (displayPosts.length > 0) {
      console.log(`[HEIMDALL][UX] Blog3D Active Index: ${activeIndex} | Slug: ${displayPosts[activeIndex].slug}`);
    }
  }, [activeIndex, displayPosts]);

  // Control de teclado con cleanup robusto
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

  // @pilar VIII: Resiliencia - Guardia de seguridad para el Build
  if (displayPosts.length === 0 || !dictionary) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#020202] py-24 sm:py-32 border-y border-white/5" 
      aria-label={dictionary.hero_title}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_70%)] pointer-events-none" />

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

      <div className="relative h-[550px] w-full flex items-center justify-center" role="region" aria-roledescription="carousel">
        <AnimatePresence initial={false} mode="popLayout">
          {displayPosts.map((post, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + displayPosts.length) % displayPosts.length;
            const isNext = index === (activeIndex + 1) % displayPosts.length;

            if (!isActive && !isPrev && !isNext) return null;

            const imageUrl = post.metadata.ogImage || `/images/blog/${post.slug}.jpg` || '/images/placeholders/editorial-fallback.jpg';

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, scale: 0.8, x: isNext ? 320 : -320 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.3, 
                  scale: isActive ? 1 : 0.8, 
                  x: isActive ? 0 : isNext ? 320 : -320,
                  zIndex: isActive ? 30 : 10,
                  filter: isActive ? 'blur(0px)' : 'blur(4px)',
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "absolute w-[300px] sm:w-[380px] aspect-3/4 rounded-[3rem] border border-white/10 bg-zinc-900 overflow-hidden shadow-3xl transform-gpu",
                  isActive ? "cursor-default" : "cursor-pointer"
                )}
                onClick={() => !isActive && (isNext ? handleNext() : handlePrev())}
              >
                <Image
                  src={imageUrl}
                  alt={post.metadata.title}
                  fill
                  className="object-cover brightness-75 transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 768px) 300px, 380px"
                  priority={isActive}
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >
                      <span className="inline-block text-[9px] font-bold text-purple-400 uppercase tracking-[0.3em]">
                        {post.metadata.tags[0] || 'Sanctuary'}
                      </span>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
                        {post.metadata.title}
                      </h3>
                      <Link 
                        href={`/${lang}/blog/${post.slug}`} 
                        className="group/btn inline-flex items-center gap-3 text-white font-bold text-[10px] uppercase tracking-[0.4em] hover:text-purple-400 transition-colors pt-2"
                      >
                        {dictionary.read_more_cta} 
                        <ArrowUpRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-12 mt-20">
        <button onClick={handlePrev} className="p-6 rounded-full border border-white/5 hover:bg-white/10 text-white transition-all active:scale-90" aria-label="Previous">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <div className="flex gap-3">
          {displayPosts.map((_, i) => (
            <motion.div 
              key={i} 
              animate={{ width: i === activeIndex ? 48 : 8, backgroundColor: i === activeIndex ? '#a855f7' : '#27272a' }}
              className="h-1 rounded-full cursor-pointer"
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
        <button onClick={handleNext} className="p-6 rounded-full border border-white/5 hover:bg-white/10 text-white transition-all active:scale-90" aria-label="Next">
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}