// RUTA: apps/portfolio-web/src/components/sections/homepage/BlogSection3D.tsx
// VERSIÓN: 5.1 - Tailwind v4 Canonical Syntax Fix
// DESCRIPCIÓN: Carrusel de "pila infinita" optimizado.
//              - Se corrige 'aspect-[3/4]' a 'aspect-3/4'.
//              - Se actualiza 'bg-gradient-to-t' a 'bg-linear-to-t' (v4 standard).

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// --- Imports de Infraestructura ---
import { BlurText } from '../../razBits/BlurText';
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

// --- Constantes de Diseño ---
const AUTOPLAY_INTERVAL = 3000;
const VISIBLE_ITEMS = 5;

type BlogSection3DProps = {
  posts: PostWithSlug[];
  dictionary: Dictionary['blog_page'];
  lang: string;
};

export function BlogSection3D({ posts, dictionary, lang }: BlogSection3DProps) {
  // 1. Estado del Carrusel
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Aseguramos que siempre haya al menos 5 items para el efecto visual (duplicando si es necesario)
  const displayPosts = posts.length < VISIBLE_ITEMS
    ? [...posts, ...posts, ...posts].slice(0, VISIBLE_ITEMS)
    : posts.slice(0, 10); // Limitamos a 10 para performance, mostramos ventana de 5

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  // 2. Autoplay (3 segundos)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [handleNext, isPaused]);

  // 3. Algoritmo de Posicionamiento Visual (The Stack Logic)
  const getCardStyle = (index: number) => {
    // Calculamos la distancia relativa circular
    const total = displayPosts.length;
    // Distancia dirigida: -2, -1, 0, 1, 2
    let offset = (index - activeIndex + total) % total;
    if (offset > total / 2) offset -= total;

    // Configuración visual por posición
    if (offset === 0) {
      // CENTER (ACTIVE)
      return {
        zIndex: 50,
        x: 0,
        scale: 1,
        opacity: 1,
        brightness: 1,
        pointerEvents: 'auto' as const
      };
    } else if (offset === 1 || offset === -1) {
      // MID LAYERS
      return {
        zIndex: 40,
        x: offset * 180, // Desplazamiento lateral
        scale: 0.85,
        opacity: 0.6,
        brightness: 0.5,
        pointerEvents: 'none' as const
      };
    } else if (offset === 2 || offset === -2) {
      // BACK LAYERS
      return {
        zIndex: 30,
        x: offset * 140, // Más comprimido atrás
        scale: 0.7,
        opacity: 0.3,
        brightness: 0.3,
        pointerEvents: 'none' as const
      };
    } else {
      // HIDDEN
      return {
        zIndex: 0,
        x: 0,
        scale: 0,
        opacity: 0,
        brightness: 0,
        pointerEvents: 'none' as const
      };
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0a0a] py-16 border-y border-white/5"
      aria-label="Blog Carousel"
    >
      {/* --- Branding & Header --- */}
      <div className="container mx-auto px-4 mb-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-purple-500" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Proprietary CMS Engine • Raz Podestá
          </span>
        </div>

        <BlurText
          text={dictionary.featured_title}
          className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl text-center"
        />
      </div>

      {/* --- The Stage (Carrusel) --- */}
      <div
        className="relative h-[450px] w-full flex items-center justify-center perspective-1000"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {displayPosts.map((post, index) => {
            const style = getCardStyle(index);
            // Solo renderizamos las cartas visibles para ahorrar DOM
            if (style.opacity === 0) return null;

            return (
              <motion.div
                key={`${post.slug}-${index}`}
                initial={false}
                animate={{
                  x: style.x,
                  scale: style.scale,
                  opacity: style.opacity,
                  zIndex: style.zIndex,
                  filter: `brightness(${style.brightness})`,
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
                // CORRECCIÓN TAILWIND V4: aspect-3/4
                className="absolute w-[300px] sm:w-[380px] aspect-3/4 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl"
                style={{
                  // Sombra blanca/glow solo para la carta activa
                  boxShadow: style.zIndex === 50
                    ? '0 20px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255,255,255,0.05)'
                    : 'none',
                  cursor: style.zIndex === 50 ? 'default' : 'none'
                }}
              >
                {/* Imagen de Fondo */}
                <div className="absolute inset-0">
                  <Image
                    src={`/images/blog/${post.slug}.jpg`}
                    alt={post.metadata.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  {/* CORRECCIÓN TAILWIND V4: bg-linear-to-t */}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-90" />
                </div>

                {/* Contenido (Solo visible e interactivo en la carta central) */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  {style.zIndex === 50 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex gap-2 mb-3">
                        {post.metadata.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-display text-2xl font-bold text-white leading-tight mb-2 line-clamp-2">
                        {post.metadata.title}
                      </h3>

                      <p className="font-sans text-sm text-zinc-400 line-clamp-2 mb-6">
                        {post.metadata.description}
                      </p>

                      <Link
                        href={`/${lang}/blog/${post.slug}`}
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-all hover:scale-105 hover:bg-zinc-200"
                      >
                        {dictionary.read_more_cta}
                        <ArrowUpRight size={14} className="transition-transform group-hover:rotate-45" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* --- Controls --- */}
      <div className="flex justify-center items-center gap-8 mt-4 relative z-50">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full border border-zinc-800 bg-black/50 text-zinc-400 transition-all hover:bg-white hover:text-black hover:border-white hover:scale-110 active:scale-95 backdrop-blur-sm"
          aria-label="Previous Post"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Indicadores de Progreso */}
        <div className="flex gap-2">
          {displayPosts.slice(0, VISIBLE_ITEMS).map((_, idx) => {
            const isActive = idx === activeIndex % Math.min(displayPosts.length, VISIBLE_ITEMS);
            return (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  isActive ? 'w-8 bg-white' : 'w-2 bg-zinc-800'
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-full border border-zinc-800 bg-black/50 text-zinc-400 transition-all hover:bg-white hover:text-black hover:border-white hover:scale-110 active:scale-95 backdrop-blur-sm"
          aria-label="Next Post"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
