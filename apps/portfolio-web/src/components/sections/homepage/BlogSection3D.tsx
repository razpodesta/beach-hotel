/**
 * @file BlogSection3D.tsx
 * @description Orquestador de visualización editorial con profundidad cinemática.
 *              Fase 7 del Embudo: Autoridad y Legado Narrativo.
 *              Refactorizado: Sincronización total con el Manifiesto Day-First, 
 *              erradicación de hardcoding y optimización de inercia 3D.
 * @version 20.0 - Atmosphere Master & i18n Safe
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { BlurText } from '../../razBits/BlurText';
import { BlogCard3D } from '../../ui/BlogCard3D';
import { cn } from '../../../lib/utils/cn';

/**
 * IMPORTACIONES DE CONTRATO (SSoT)
 */
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 8000;

/**
 * @interface BlogSection3DProps
 */
interface BlogSection3DProps {
  /** Colección de artículos saneada por el motor de datos v29.0 */
  posts: PostWithSlug[];
  /** Diccionario nivelado (blog_page) */
  dictionary: Dictionary['blog_page'];
  /** Contexto de idioma para rumbos SEO */
  lang: string;
  className?: string;
}

/**
 * APARATO: BlogSection3D
 * @description Presenta los artículos más relevantes en un carrusel 3D adaptativo.
 */
export function BlogSection3D({ posts, dictionary, lang, className }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * @pilar II: Cero Regresiones - Desestructuración segura del diccionario nivelado.
   */
  const { hero_title, featured_title, read_more_cta, all_posts_title } = useMemo(() => 
    dictionary || {}, 
  [dictionary]);

  /**
   * @pilar X: Rendimiento de Élite. 
   * Limitamos el buffer visual para optimizar el consumo de GPU.
   */
  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);

  const activePost = useMemo(() => displayPosts[activeIndex], [displayPosts, activeIndex]);
  const isNightVibe = activePost?.metadata.vibe === 'night';

  const handleNext = useCallback(() => {
    if (displayPosts.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    if (displayPosts.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría Forense
   * @pilar IV: Agrupación de eventos de interacción editorial.
   */
  useEffect(() => {
    if (activePost) {
      console.group(`[HEIMDALL][UX] Editorial_Carousel_Orbit`);
      console.log(`Target_Post: ${activePost.slug}`);
      console.log(`Vibe_Detected: ${activePost.metadata.vibe}`);
      console.groupEnd();
    }
  }, [activePost]);

  /**
   * MOTOR DE AUTOPLAY (Power-Aware)
   */
  useEffect(() => {
    if (isPaused || displayPosts.length <= 1) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleNext();
      }
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [handleNext, isPaused, displayPosts.length]);

  // Guardia de Resiliencia ante datos nulos (Pilar VIII)
  if (!posts || displayPosts.length === 0 || !dictionary) return null;

  return (
    <section 
      /**
       * @pilar VII: Theming Soberano
       * Sustituimos fondo negro fijo por 'bg-background'.
       */
      className={cn(
        "relative w-full overflow-hidden bg-background py-24 sm:py-40 border-y border-border transition-colors duration-1000 selection:bg-primary/20",
        className
      )} 
      aria-label={hero_title}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 
          CAPA ATMOSFÉRICA (Glow Adaptativo) 
          @fix: sintaxis oklch para evitar errores de compilación en Vercel.
      */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-1500",
        isNightVibe ? "opacity-30" : "opacity-10"
      )} 
        style={{ 
          background: `radial-gradient(circle at center, ${isNightVibe ? 'oklch(70% 0.15 320)' : 'oklch(65% 0.25 270)'}, transparent 70%)` 
        }} 
      />

      {/* HEADER NARRATIVO (i18n Compliant) */}
      <div className="container mx-auto px-6 mb-24 flex flex-col items-center text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <Sparkles size={16} className={cn("animate-pulse", isNightVibe ? "text-accent" : "text-primary")} />
          <span className="text-[10px] font-bold tracking-[0.6em] text-muted-foreground uppercase font-mono transition-colors">
            {hero_title}
          </span>
        </motion.div>
        
        <BlurText 
          text={featured_title?.toUpperCase() || ''} 
          className="text-4xl md:text-8xl font-display font-bold justify-center tracking-tighter text-foreground drop-shadow-2xl transition-colors duration-1000" 
          animateBy="letters"
        />
      </div>

      {/* CARRETE 3D (Core Motion Engine) */}
      <div 
        className="relative h-[550px] md:h-[650px] w-full flex items-center justify-center perspective-2000"
        style={{ transformStyle: "preserve-3d" }}
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
                initial={{ 
                  opacity: 0, 
                  scale: 0.85, 
                  x: 180, 
                  rotateY: 45, 
                  filter: 'blur(12px)' 
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0, 
                  rotateY: 0, 
                  filter: 'blur(0px)' 
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 1.1, 
                  x: -180, 
                  rotateY: -45, 
                  filter: 'blur(12px)' 
                }}
                transition={{ 
                  duration: 0.9, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="z-20 transform-gpu"
                style={{ transformStyle: "preserve-3d" }}
              >
                <BlogCard3D 
                   post={post} 
                   lang={lang} 
                   ctaText={read_more_cta || ''} 
                   tagLabel={all_posts_title || 'Journal'}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* CONTROLES TÁCTICOS (Thumb-Driven & Atmosphere Aware) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 sm:px-12 pointer-events-none z-30">
          <button 
            onClick={handlePrev} 
            className={cn(
              "group p-6 sm:p-8 rounded-full border transition-all duration-500 pointer-events-auto backdrop-blur-2xl active:scale-90 shadow-3xl outline-none focus-visible:ring-2",
              "bg-surface/80 border-border text-foreground hover:bg-foreground hover:text-background",
              isNightVibe ? "focus-visible:ring-accent" : "focus-visible:ring-primary"
            )}
            aria-label={dictionary.all_posts_title} // Fallback semántico para "Anterior"
          >
            <ChevronLeft size={32} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={handleNext} 
            className={cn(
              "group p-6 sm:p-8 rounded-full border transition-all duration-500 pointer-events-auto backdrop-blur-2xl active:scale-90 shadow-3xl outline-none focus-visible:ring-2",
              "bg-surface/80 border-border text-foreground hover:bg-foreground hover:text-background",
              isNightVibe ? "focus-visible:ring-accent" : "focus-visible:ring-primary"
            )}
            aria-label={dictionary.read_more_cta} // Fallback semántico para "Siguiente"
          >
            <ChevronRight size={32} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* INDICADORES DE PROGRESO ADAPTATIVOS */}
      <div className="flex justify-center items-center gap-5 mt-16 relative z-10" role="tablist">
        {displayPosts.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setActiveIndex(i)}
            role="tab"
            aria-selected={i === activeIndex}
            className="group p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full transition-all"
            aria-label={`${dictionary.hero_title} - ${i + 1}`}
          >
            <motion.div 
              animate={{ 
                width: i === activeIndex ? 56 : 14,
                backgroundColor: i === activeIndex 
                  ? (isNightVibe ? 'var(--color-accent)' : 'var(--color-primary)')
                  : 'var(--color-border)'
              }}
              className="h-1.5 rounded-full transition-colors group-hover:bg-muted-foreground"
            />
          </button>
        ))}
      </div>
    </section>
  );
}