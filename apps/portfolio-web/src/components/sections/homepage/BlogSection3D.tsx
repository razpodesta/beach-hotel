/**
 * @file BlogSection3D.tsx
 * @description Orquestador de visualización editorial con profundidad cinemática.
 *              Refactorizado: Sincronización atmosférica OKLCH v2.0, 
 *              autoplay con conciencia de visibilidad (Energy-Aware), 
 *              telemetría Heimdall v2.0 y cumplimiento de fronteras Nx.
 * @version 22.0 - Energy Efficient & Atmosphere Immersive
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas - Nx Boundary Safe)
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
  posts: PostWithSlug[];
  dictionary: Dictionary['blog_page'];
  lang: string;
  className?: string;
}

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/**
 * APARATO: BlogSection3D
 * @description Presenta los artículos más relevantes en un carrusel 3D adaptativo con inteligencia de atmósfera.
 */
export function BlogSection3D({ posts, dictionary, lang, className }: BlogSection3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTransitionTime = useRef<number>(0);

  /**
   * MEMOIZACIÓN DE DICCIONARIO & DATA (Pilar X)
   */
  const labels = useMemo(() => ({
    heroTitle: dictionary?.hero_title || 'Journal',
    featuredTitle: dictionary?.featured_title || 'Latest',
    readMoreCta: dictionary?.read_more_cta || 'Read',
    allPostsTitle: dictionary?.all_posts_title || 'Editorial'
  }), [dictionary]);

  const displayPosts = useMemo(() => (posts || []).slice(0, 5), [posts]);
  const activePost = useMemo(() => displayPosts[activeIndex], [displayPosts, activeIndex]);
  const isNightVibe = activePost?.metadata.vibe === 'night';

  /**
   * HANDLERS DE NAVEGACIÓN (MEA/UX)
   */
  const handleNext = useCallback(() => {
    if (displayPosts.length <= 1) return;
    const start = performance.now();
    
    setActiveIndex((prev) => (prev + 1) % displayPosts.length);
    
    // Telemetría de Latencia de Transición
    const duration = (performance.now() - start).toFixed(4);
    lastTransitionTime.current = parseFloat(duration);
  }, [displayPosts.length]);

  const handlePrev = useCallback(() => {
    if (displayPosts.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + displayPosts.length) % displayPosts.length);
  }, [displayPosts.length]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Foco & Salud Energética
   */
  useEffect(() => {
    if (activePost && isInView) {
      console.log(
        `${C.magenta}[DNA][3D-ENGINE]${C.reset} Focus_Asset: ${C.cyan}${activePost.slug}${C.reset} | ` +
        `Vibe: ${isNightVibe ? C.yellow + 'NIGHT' : C.green + 'DAY'}${C.reset} | ` +
        `Transition: ${lastTransitionTime.current}ms`
      );
    }
  }, [activePost, isNightVibe, isInView]);

  /**
   * MOTOR DE VISIBILIDAD (Pilar VIII & X)
   * @description Pausa el motor 3D si el usuario no está viendo la sección.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * MOTOR DE AUTOPLAY (Energy-Aware)
   */
  useEffect(() => {
    const startTimer = () => {
      autoplayTimerRef.current = setInterval(() => {
        if (!isPaused && isInView && document.visibilityState === 'visible') {
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
  }, [handleNext, isPaused, isInView]);

  if (!posts || displayPosts.length === 0 || !dictionary) return null;

  return (
    <section 
      ref={sectionRef}
      className={cn(
        "relative w-full overflow-hidden bg-background py-24 sm:py-40 border-y border-border transition-colors duration-1000 selection:bg-primary/20",
        className
      )} 
      aria-label={labels.heroTitle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 
          CAPA ATMOSFÉRICA (Glow Adaptativo OKLCH) 
          @pilar VII: Sincronización sensorial Day/Night.
      */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-all duration-1500 ease-in-out",
          isInView ? "opacity-100" : "opacity-0"
        )} 
        style={{ 
          background: isNightVibe 
            ? `radial-gradient(circle at center, color-mix(in oklch, var(--color-accent) 15%, transparent), transparent 70%)`
            : `radial-gradient(circle at center, color-mix(in oklch, var(--color-primary) 10%, transparent), transparent 70%)`
        }} 
      />

      {/* HEADER NARRATIVO (i18n) */}
      <div className="container relative z-10 mx-auto mb-24 flex flex-col items-center px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex items-center gap-3"
        >
          <Sparkles size={16} className={cn("animate-pulse", isNightVibe ? "text-accent" : "text-primary")} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.6em] text-muted-foreground/60">
            {labels.heroTitle}
          </span>
        </motion.div>
        
        <BlurText 
          text={labels.featuredTitle.toUpperCase()} 
          className="justify-center font-display text-4xl font-bold tracking-tighter text-foreground drop-shadow-2xl transition-colors duration-1000 md:text-8xl" 
          animateBy="letters"
        />
      </div>

      {/* CARRETE 3D (Core Motion Engine) */}
      <div 
        className="perspective-2000 relative flex h-[600px] w-full items-center justify-center md:h-[700px]"
        style={{ transformStyle: "preserve-3d" }}
        role="region"
        aria-roledescription="carousel"
        aria-live="polite"
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
        <div className="absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-between px-6 pointer-events-none sm:px-12">
          <button 
            onClick={handlePrev} 
            className="group pointer-events-auto rounded-full border border-border bg-surface/80 p-6 text-foreground shadow-3xl outline-none backdrop-blur-2xl transition-all duration-500 hover:bg-foreground hover:text-background active:scale-90 focus-visible:ring-2 focus-visible:ring-primary sm:p-8"
            aria-label="Anterior"
          >
            <ChevronLeft size={32} strokeWidth={1.5} className="transition-transform group-hover:-translate-x-1" />
          </button>
          <button 
            onClick={handleNext} 
            className="group pointer-events-auto rounded-full border border-border bg-surface/80 p-6 text-foreground shadow-3xl outline-none backdrop-blur-2xl transition-all duration-500 hover:bg-foreground hover:text-background active:scale-90 focus-visible:ring-2 focus-visible:ring-primary sm:p-8"
            aria-label="Siguiente"
          >
            <ChevronRight size={32} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* INDICADORES DE PROGRESO SOBERANOS */}
      <div className="relative z-10 mt-8 flex items-center justify-center gap-5" role="tablist">
        {displayPosts.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setActiveIndex(i)}
            role="tab"
            aria-selected={i === activeIndex}
            className="group rounded-full p-2 outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Slide ${i + 1}`}
          >
            <motion.div 
              animate={{ 
                width: i === activeIndex ? 60 : 12,
                backgroundColor: i === activeIndex 
                  ? (isNightVibe ? 'var(--color-accent)' : 'var(--color-primary)')
                  : 'var(--color-border)'
              }}
              className="h-1.5 rounded-full transition-colors group-hover:bg-muted-foreground/60"
            />
          </button>
        ))}
      </div>

      {/* TELEMETRÍA DE INFRAESTRUCTRURA (Overlay sutil) */}
      <div className="absolute bottom-4 left-8 flex items-center gap-3 opacity-10 pointer-events-none">
         <Eye size={12} className="text-muted-foreground" />
         <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-muted-foreground">
           3D Rendering Buffer: {isInView ? 'ACTIVE' : 'DORMANT'}
         </span>
      </div>
    </section>
  );
}