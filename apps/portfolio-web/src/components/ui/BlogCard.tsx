/**
 * @file BlogCard.tsx
 * @description Aparato editorial de alta fidelidad con inteligencia atmosférica. 
 *              Orquesta la visualización de artículos sincronizando el 'vibe' 
 *              del contenido con la identidad visual (Día/Noche).
 * @version 12.0 - Atmosphere & LCP Optimized (React 19)
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
  Sparkles 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import type { BlogPost } from '../../lib/schemas/blog.schema';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import type { Locale } from '../../config/i18n.config';

/**
 * @interface BlogCardProps
 * @pilar III: Seguridad de Tipos Absoluta (SSoT).
 */
interface BlogCardProps {
  /** Metadatos del artículo validados por Zod (Incluye vibe y readingTime) */
  post: BlogPost;
  /** Identificador semántico */
  slug: string;
  /** Contexto de idioma */
  lang: Locale;
  /** Etiqueta de acción inyectada vía diccionario */
  ctaText: string;
  /** Sobrescritura de asset opcional */
  customImage?: string;
  /** Optimización LCP: Prioridad de carga si está sobre el pliegue */
  priority?: boolean;
  className?: string;
}

/**
 * APARATO: BlogCard
 * @description Representa la unidad fundamental del Journal. Reacciona visualmente al 'vibe'.
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
   * PROTOCOLO HEIMDALL: Telemetría de Renderizado
   * @pilar IV: Observabilidad de impacto en LCP.
   */
  useEffect(() => {
    if (priority) {
      console.log(`[HEIMDALL][PERF] LCP Candidate Card: ${slug} | Vibe: ${post.vibe}`);
    }
  }, [priority, slug, post.vibe]);

  const postUrl = getLocalizedHref(`/blog/${slug}`, lang);

  /**
   * LÓGICA DE ATMÓSFERA (Pilar VII & XII)
   * Determina los tokens de color basados en el ADN del contenido.
   */
  const isNight = post.vibe === 'night';
  const themeTokens = useMemo(() => ({
    accent: isNight ? 'text-accent' : 'text-primary',
    bgBadge: isNight ? 'bg-accent/10' : 'bg-primary/10',
    borderBadge: isNight ? 'border-accent/20' : 'border-primary/20',
    borderHover: isNight ? 'group-hover:border-accent/40' : 'group-hover:border-primary/40',
    shadowHover: isNight ? 'group-hover:shadow-accent/10' : 'group-hover:shadow-primary/10',
    glow: isNight ? 'bg-accent/5' : 'bg-primary/5'
  }), [isNight]);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang, {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
      }).format(new Date(post.published_date));
    } catch {
      return post.published_date;
    }
  }, [post.published_date, lang]);

  const finalImageUrl = customImage || post.ogImage || `/images/blog/${slug}.jpg`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[3rem] border bg-surface/30 backdrop-blur-sm",
        "transition-all duration-700 transform-gpu border-border",
        themeTokens.borderHover,
        themeTokens.shadowHover,
        className
      )}
    >
      {/* 1. CAPA VISUAL (LCP Focused) */}
      <div className="relative aspect-video w-full overflow-hidden bg-background">
        <Image
          src={finalImageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 450px"
          priority={priority}
          {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })}
        />
        
        {/* Overlay de profundidad cinemática */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent opacity-90" />
        
        {/* BADGE DE ATMÓSFERA (Taxonomía Reactiva) */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2">
           {post.tags.slice(0, 2).map((tag) => (
             <span 
               key={tag}
               className={cn(
                 "inline-flex items-center gap-2 rounded-full backdrop-blur-xl border px-4 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em]",
                 "bg-background/40",
                 themeTokens.accent,
                 themeTokens.borderBadge
               )}
             >
               <Sparkles size={10} className={cn(isNight && "animate-pulse")} />
               {tag}
             </span>
           ))}
        </div>
      </div>

      {/* 2. CAPA NARRATIVA (DNA Editorial) */}
      <div className="flex grow flex-col p-8 md:p-10 relative z-10">
        <div className="mb-6 flex items-center gap-6 text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="opacity-50" /> 
            <time dateTime={post.published_date}>{formattedDate}</time>
          </div>
          {post.readingTime && (
            <div className="flex items-center gap-2">
              <Clock size={12} className="opacity-50" /> {post.readingTime} min
            </div>
          )}
          <div className="flex items-center gap-2">
            <User size={12} className="opacity-50" /> {post.author}
          </div>
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight text-foreground mb-5 transition-colors group-hover:text-foreground/90">
          <Link href={postUrl} className="after:absolute after:inset-0 outline-none">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm md:text-base text-muted-foreground font-sans font-light leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* 3. FOOTER DE CONVERSIÓN */}
      <footer className="relative z-30 border-t border-border p-8 bg-surface/50 flex items-center justify-between">
        <div className={cn(
          "flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] transition-all",
          "text-foreground group-hover:translate-x-1",
          isNight && "group-hover:text-accent"
        )}>
          {ctaText} 
          <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-1" />
        </div>
        <div className={cn(
          "h-2 w-2 rounded-full animate-pulse transition-colors duration-700",
          isNight ? "bg-accent shadow-[0_0_10px_var(--color-accent)]" : "bg-primary"
        )} />
      </footer>

      {/* Elemento MEA: Resplandor Interior según Vibe */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none",
        themeTokens.glow
      )} />
    </motion.article>
  );
}