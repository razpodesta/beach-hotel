/**
 * @file BlogSection3D.tsx
 * @description Orquestador de visualización editorial con profundidad cinemática.
 *              Implementa carrusel 3D con inercia, detección de atmósfera dinámica
 *              y motor de autoplay inteligente de bajo consumo.
 * @version 21.0 - Energy Aware Autoplay & OKLCH Atmosphere Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a fronteras Nx.
 */
import { BlurText } from '../../razBits/BlurText';
import { BlogCard3D } from '../../ui/BlogCard3D';
import { cn } from '../../../lib/utils/cn';

/**
 * IMPORTACIONES DE CONTRATO (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
import type { PostWithSlug } from '../../../lib/schemas/blog.schema';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

const AUTOPLAY_INTERVAL = 8000;

/**
 * @interface BlogSection3DProps
 */
interface BlogSection3DProps {
  /** Colección de artículos saneada por el motor de datos v31.0 */
  posts: PostWithSlug[];
  /** Diccionario nivelado (blog_page) validado por MACS */
  dictionary: Dictionary['blog_page'];
  /** Contexto de idioma para rumbos SEO */
  lang: string;
  className?: string;
}

/**
 * APARATO: BlogSection3D
 * @description Presenta los artículos más relevantes en un carrusel 3D adaptativo.
 *              Fase de Embudo: Trust & Authority.
 */
export function BlogSection3D({ posts, dictionary, lang, className }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * MEMOIZACIÓN DE DICCIONARIO (Pilar X)
   * Extraemos las etiquetas del contrato soberano.
   */
  const labels = useMemo(() => ({
    heroTitle: dictionary?.hero_title || 'Journal',
    featuredTitle: dictionary?.featured_title || 'Latest',
    readMoreCta: dictionary?.read_more_cta || 'Read',
    allPostsTitle: dictionary?.all_posts_title || 'Editorial'
  }), [dictionary]);

  /**
   * BUFFER VISUAL OPTIMIZADO
   * @description Limitamos a 5 elementos para maximizar el rendimiento de la GPU.
   */
  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);
  const activePost = useMemo(() => displayPosts[activeIndex], [displayPosts, activeIndex]);
  const isNightVibe = activePost?.metadata.vibe === 'night';

  /**
   * HANDLERS DE NAVEGACIÓN (Pilar XII)
   * @description Implementa useCallback para evitar jank en renderizados de alta frecuencia.
   */
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
   * @pilar IV: Rastreo de cambios de slide y contexto de atmósfera.
   */
  useEffect(() => {
    if (activePost) {
      console.log(`[HEIMDALL][UX] Journal_Slide_Focus: ${activePost.slug} | Atmosphere: ${activePost.metadata.vibe}`);
    }
  }, [activePost]);

  /**
   * MOTOR DE AUTOPLAY (Energy-Aware)
   * @description Solo ejecuta el timer si el componente es visible y no está pausado.
   */
  useEffect(() => {
    const startTimer = () => {
      autoplayTimerRef.current = setInterval(() => {
        if (!isPaused && document.visibilityState === 'visible') {
          handleNext();
        }
      }, AUTOPLAY_INTERVAL);
    };

    const stopTimer = () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };

    startTimer();
    return () => stopTimer();
  }, [handleNext, isPaused]);

  // Guardia de Resiliencia ante datos nulos (Pilar VIII)
  if (!posts || displayPosts.length === 0 || !dictionary) return null;

  return (
    <section 
      className={cn(
        "relative w-full overflow-hidden bg-background py-24 sm:py-40 border-y border-border transition-colors duration-1000 selection:bg-primary/20",
        className
      )} 
      aria-label={labels.heroTitle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 
          CAPA ATMOSFÉRICA (Glow Adaptativo) 
          @pilar VII: Uso de OKLCH para una saturación de color boutique en ambos temas.
      */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1500",
          isNightVibe ? "opacity-25" : "opacity-10"
        )} 
        style={{ 
          background: `radial-gradient(circle at center, ${isNightVibe ? 'oklch(70% 0.15 320)' : 'oklch(65% 0.25 270)'}, transparent 75%)` 
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
          <span className="text-[10px] font-bold tracking-[0.6em] text-muted-foreground uppercase font-mono">
            {labels.heroTitle}
          </span>
        </motion.div>
        
        <BlurText 
          text={labels.featuredTitle.toUpperCase()} 
          className="text-4xl md:text-8xl font-display font-bold justify-center tracking-tighter text-foreground drop-shadow-2xl transition-colors duration-1000" 
          animateBy="letters"
        />
      </div>

      {/* CARRETE 3D (Core Motion Engine) */}
      <div 
        className="relative h-[600px] md:h-[700px] w-full flex items-center justify-center perspective-2000"
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
                initial={{ opacity: 0, scale: 0.85, x: 200, rotateY: 45, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, x: -200, rotateY: -45, filter: 'blur(12px)' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="z-20 transform-gpu"
                style={{ transformStyle: "preserve-3d" }}
              >
                <BlogCard3D 
                   post={post} 
                   lang={lang} 
                   ctaText={labels.readMoreCta} 
                   tagLabel={labels.allPostsTitle}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* CONTROLES TÁCTICOS (Thumb-Driven UX) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 sm:px-12 pointer-events-none z-30">
          <button 
            onClick={handlePrev} 
            className="group p-6 sm:p-8 rounded-full border border-border bg-surface/80 text-foreground hover:bg-foreground hover:text-background transition-all duration-500 pointer-events-auto backdrop-blur-2xl active:scale-90 shadow-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Anterior"
          >
            <ChevronLeft size={32} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={handleNext} 
            className="group p-6 sm:p-8 rounded-full border border-border bg-surface/80 text-foreground hover:bg-foreground hover:text-background transition-all duration-500 pointer-events-auto backdrop-blur-2xl active:scale-90 shadow-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Siguiente"
          >
            <ChevronRight size={32} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* INDICADORES DE PROGRESO SOBERANOS */}
      <div className="flex justify-center items-center gap-5 mt-8 relative z-10" role="tablist">
        {displayPosts.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setActiveIndex(i)}
            role="tab"
            aria-selected={i === activeIndex}
            className="group p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full transition-all"
            aria-label={`Slide ${i + 1}`}
          >
            <motion.div 
              animate={{ 
                width: i === activeIndex ? 60 : 12,
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