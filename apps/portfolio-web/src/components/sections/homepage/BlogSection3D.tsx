// RUTA: apps/portfolio-web/src/components/sections/homepage/BlogSection3D.tsx

/**
 * @file BlogSection3D.tsx
 * @version 6.0 - High-Performance Stack Carousel
 * @description Carrusel orbital inmersivo. Utiliza Framer Motion para 
 *              gestión de estado visual y animaciones nativas. 
 *              Arquitectura "Mobile-First": desactiva interacciones pesadas en móviles.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '../../../lib/utils/cn';
import { BlurText } from '../../razBits/BlurText';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 4000;

export function BlogSection3D({ posts, dictionary, lang }: { 
  posts: PostWithSlug[], 
  dictionary: Dictionary['blog_page'], 
  lang: string 
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Aseguramos un bucle continuo de datos
  const displayPosts = posts.slice(0, 5);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused]);

  return (
    <section className="relative w-full overflow-hidden bg-background py-24 border-y border-border" aria-label="Blog Carousel">
      
      {/* Branding Header */}
      <div className="container mx-auto px-4 mb-16 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <Layers size={14} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Sovereign CMS Engine • v3.0
          </span>
        </div>
        <BlurText text={dictionary.featured_title} className="text-3xl sm:text-4xl font-display font-bold justify-center" />
      </div>

      {/* Stack Container */}
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
                  opacity: isActive ? 1 : 0.5, 
                  scale: isActive ? 1 : 0.9, 
                  x: isActive ? 0 : isNext ? 200 : -200,
                  zIndex: isActive ? 20 : 10,
                  filter: isActive ? 'blur(0px)' : 'blur(4px)'
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "absolute w-[320px] aspect-3/4 rounded-2xl border border-border bg-card overflow-hidden shadow-2xl",
                  isActive ? "cursor-default" : "cursor-pointer"
                )}
                onClick={() => !isActive && (isNext ? handleNext() : handlePrev())}
              >
                <Image
                  src={`/images/blog/${post.slug}.jpg`}
                  alt={post.metadata.title}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
                   {isActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      <h3 className="font-display text-xl font-bold text-white mb-2 line-clamp-2">{post.metadata.title}</h3>
                      <Link href={`/${lang}/blog/${post.slug}`} className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase">
                        {dictionary.read_more_cta} <ArrowUpRight size={14} />
                      </Link>
                    </motion.div>
                   )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6 mt-12">
        <button onClick={handlePrev} className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-all">
          <ChevronLeft size={20} />
        </button>
        <button onClick={handleNext} className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}