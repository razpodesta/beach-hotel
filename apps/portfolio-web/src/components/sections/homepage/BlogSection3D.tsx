// RUTA: apps/portfolio-web/src/components/sections/homepage/BlogSection3D.tsx
// VERSIÓN: 7.1 - Elite Editorial & Keyboard Accessible
// DESCRIPCIÓN: Carrusel editorial de alta disponibilidad. Añadido soporte de teclado
//              y optimización de renderizado para máxima performance.

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '../../../lib/utils/cn';
import { BlurText } from '../../razBits/BlurText';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 5000;

interface BlogSection3DProps {
  posts: PostWithSlug[];
  dictionary: Dictionary['blog_page'];
  lang: string;
}

export function BlogSection3D({ posts, dictionary, lang }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Memoización para optimizar el slice y el orden
  const displayPosts = useMemo(() => posts.slice(0, 5), [posts]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  // Soporte para navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused]);

  if (displayPosts.length === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#020202] py-24 border-y border-white/5" 
      aria-label="Concierge Journal"
    >
      <div className="container mx-auto px-6 mb-20 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 text-purple-500">
          <Sparkles size={14} />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
            Concierge Journal
          </span>
        </div>
        <BlurText 
          text={dictionary.featured_title} 
          className="text-4xl md:text-6xl font-display font-bold justify-center tracking-tighter" 
        />
      </div>

      <div 
        className="relative h-[480px] w-full flex items-center justify-center perspective-1000"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="popLayout">
          {displayPosts.map((post, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + displayPosts.length) % displayPosts.length;
            const isNext = index === (activeIndex + 1) % displayPosts.length;

            if (!isActive && !isPrev && !isNext) return null;

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, scale: 0.8, x: isNext ? 200 : -200 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.4, 
                  scale: isActive ? 1 : 0.9, 
                  x: isActive ? 0 : isNext ? 240 : -240,
                  zIndex: isActive ? 20 : 10,
                  filter: isActive ? 'blur(0px)' : 'blur(8px)'
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "absolute w-[300px] md:w-[360px] aspect-[3/4] rounded-3xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl",
                  isActive ? "cursor-default" : "cursor-pointer"
                )}
                onClick={() => !isActive && (isNext ? handleNext() : handlePrev())}
              >
                <Image
                  src={`/images/blog/${post.slug}.jpg`}
                  alt={post.metadata.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 300px, 360px"
                  priority={isActive}
                />
                
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                   {isActive && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <h3 className="font-display text-2xl font-bold text-white mb-3 tracking-tight line-clamp-2">
                        {post.metadata.title}
                      </h3>
                      <Link 
                        href={`/${lang}/blog/${post.slug}`} 
                        className="inline-flex items-center gap-2 text-purple-400 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                      >
                        {dictionary.read_more_cta} <ArrowUpRight size={12} />
                      </Link>
                    </motion.div>
                   )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-6 mt-16">
        <button onClick={handlePrev} aria-label="Previous" className="p-4 rounded-full border border-white/10 text-white hover:bg-white/5 transition-all">
          <ChevronLeft size={20} />
        </button>
        <button onClick={handleNext} aria-label="Next" className="p-4 rounded-full border border-white/10 text-white hover:bg-white/5 transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}