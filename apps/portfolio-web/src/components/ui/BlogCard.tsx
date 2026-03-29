/**
 * @file BlogCard.tsx
 * @description Unidad editorial de alta fidelidad con inteligencia atmosférica.
 *              Refactorizado: Limpieza de importaciones huérfanas, normalización
 *              de clases canónicas de Tailwind v4 y optimización de rendimiento LCP.
 * @version 14.0 - Linter Pure & Tailwind Canonical Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Calendar, 
  User, 
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a las fronteras del Monorepo.
 */
import { cn } from '../../lib/utils/cn';
import type { BlogPost } from '../../lib/schemas/blog.schema';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import type { Locale } from '../../config/i18n.config';

/**
 * @interface BlogCardProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface BlogCardProps {
  /** Metadatos del artículo validados por Constitución Editorial */
  post: BlogPost;
  /** Identificador semántico único */
  slug: string;
  /** Contexto de idioma para resolución de rumbos */
  lang: Locale;
  /** Etiqueta de acción inyectada vía diccionario */
  ctaText: string;
  /** Sobrescritura de activo visual opcional */
  customImage?: string;
  /** Optimización LCP: Prioridad máxima para elementos sobre el pliegue */
  priority?: boolean;
  className?: string;
}

/**
 * APARATO: BlogCard
 * @description Unidad fundamental de la narrativa Journal.
 *              Implementa Pilar XII (MEA/UX) mediante transiciones cromáticas orgánicas.
 */
export function BlogCard({ 
  post, 
  slug, 
  lang, 
  ctaText, 
  customImage,
  priority = false,
  className 
}: BlogCardProps) {
  
  /**
   * PROTOCOLO HEIMDALL: Telemetría de Impresión
   * @pilar IV: Registra el rendimiento y la visibilidad del activo.
   */
  useEffect(() => {
    if (priority) {
      console.log(`[HEIMDALL][PERF] LCP Priority Engaged: JournalCard[${slug}]`);
    }
  }, [priority, slug]);

  /**
   * RESOLUCIÓN DE RUMBOS (Pilar X)
   */
  const postUrl = useMemo(() => 
    getLocalizedHref(`/blog/${slug}`, lang), 
  [slug, lang]);

  /**
   * MOTOR DE ATMÓSFERA SOBERANA (Pilar VII & XII)
   * @description Define la coreografía de colores basada en el ADN del contenido.
   */
  const isNight = post.vibe === 'night';
  
  const atmosphere = useMemo(() => ({
    accent: isNight ? 'text-accent' : 'text-primary',
    bgBadge: isNight ? 'bg-accent/10' : 'bg-primary/10',
    borderBadge: isNight ? 'border-accent/20' : 'border-primary/20',
    borderHover: isNight ? 'group-hover:border-accent/40' : 'group-hover:border-primary/40',
    shadowHover: isNight ? 'group-hover:shadow-accent/10' : 'group-hover:shadow-primary/10',
    innerGlow: isNight ? 'bg-accent/5' : 'bg-primary/5',
    indicator: isNight 
      ? 'bg-accent shadow-[0_0_12px_var(--color-accent)]' 
      : 'bg-primary shadow-[0_0_12px_var(--color-primary)]'
  }), [isNight]);

  /**
   * FORMATEO CRONOLÓGICO (Pilar X)
   */
  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang, {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
      }).format(new Date(post.published_date));
    } catch {
      return 'Editorial Sync...';
    }
  }, [post.published_date, lang]);

  const finalImageUrl = customImage || post.ogImage || `/images/blog/${slug}.jpg`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[3.5rem] border bg-surface/30 backdrop-blur-xl",
        "transition-all duration-700 transform-gpu border-border",
        atmosphere.borderHover,
        atmosphere.shadowHover,
        className
      )}
      role="listitem"
    >
      {/* --- 1. CAPA VISUAL (LCP Elite Protocol) --- */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-background">
        <Image
          src={finalImageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-2000 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 450px"
          priority={priority}
          {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })}
        />
        
        {/* Overlay de profundidad inmersiva */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent opacity-80 transition-opacity duration-1000 group-hover:opacity-60" />
        
        {/* TAXONOMÍA DE ATMÓSFERA */}
        <div className="absolute top-8 left-8 z-20 flex flex-wrap gap-2.5">
           {post.tags.slice(0, 2).map((tag) => (
             <span 
               key={tag}
               className={cn(
                 "inline-flex items-center gap-2 rounded-full backdrop-blur-3xl border px-5 py-2 text-[9px] font-bold uppercase tracking-[0.25em]",
                 "bg-background/60",
                 atmosphere.accent,
                 atmosphere.borderBadge
               )}
             >
               <Sparkles size={12} className={cn(isNight && "animate-pulse")} />
               {tag}
             </span>
           ))}
        </div>
      </div>

      {/* --- 2. CAPA NARRATIVA (Editorial DNA) --- */}
      <div className="flex grow flex-col p-10 md:p-12 relative z-10">
        <div className="mb-8 flex items-center gap-8 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-foreground/60">
          <div className="flex items-center gap-2.5">
            <Calendar size={14} className="opacity-40" /> 
            <time dateTime={post.published_date}>{formattedDate}</time>
          </div>
          {post.readingTime && (
            <div className="flex items-center gap-2.5 text-primary/80">
              <Clock size={14} className="opacity-40" /> {post.readingTime} min
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2.5">
            <User size={14} className="opacity-40" /> {post.author}
          </div>
        </div>

        <h3 className="font-display text-3xl md:text-4xl font-bold leading-[1.1] text-foreground mb-6 tracking-tighter transition-all duration-500 group-hover:text-foreground">
          <Link href={postUrl} className="after:absolute after:inset-0 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-base md:text-lg text-muted-foreground font-sans font-light leading-relaxed italic">
          {post.description}
        </p>
      </div>

      {/* --- 3. FOOTER DE CONVERSIÓN (Action Bar) --- */}
      <footer className="relative z-30 border-t border-border/50 p-10 bg-surface/50 flex items-center justify-between">
        <div className={cn(
          "flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500",
          "text-foreground group-hover:translate-x-2",
          isNight && "group-hover:text-accent"
        )}>
          <BookOpen size={16} className="opacity-40" />
          {ctaText} 
          <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-1.5" />
        </div>
        
        {/* Indicador de Latido Sensorial */}
        <div className={cn(
          "h-2.5 w-2.5 rounded-full animate-pulse transition-all duration-700",
          atmosphere.indicator
        )} />
      </footer>

      {/* Elemento MEA: Resplandor Interior Adaptativo */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none",
        atmosphere.innerGlow
      )} />
    </motion.article>
  );
}