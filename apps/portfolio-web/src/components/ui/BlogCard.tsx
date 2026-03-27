/**
 * @file BlogCard.tsx
 * @description Aparato editorial de alta fidelidad. 
 *              Orquesta la visualización de artículos con enfoque en Core Web Vitals y
 *              seguridad de tipos absoluta (Zero Any).
 * @version 11.0 - Type Hardening & LCP Optimized
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Calendar, 
  User, 
  Tag as TagIcon,
  Sparkles 
} from 'lucide-react';

import { cn } from '../../lib/utils/cn';
import type { BlogPost } from '../../lib/schemas/blog.schema';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import type { Locale } from '../../config/i18n.config';

/**
 * @interface BlogCardProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface BlogCardProps {
  /** Metadatos del artículo validados por Zod */
  post: BlogPost;
  /** Identificador semántico para rumbos SEO */
  slug: string;
  /** Contexto de idioma tipado por la constitución i18n */
  lang: Locale;
  /** Etiqueta de acción inyectada vía diccionario */
  ctaText: string;
  /** Sobrescritura de asset opcional para coherencia visual */
  customImage?: string;
  /** Optimización LCP: Carga prioritaria si el componente está sobre el pliegue */
  priority?: boolean;
  className?: string;
}

/**
 * APARATO: BlogCard
 * @description Representa la unidad fundamental del Hub Editorial MetaShark.
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
   * RESOLUCIÓN DE RUMBOS SOBERANOS
   * @pilar III: Erradicación de 'as any'. Sincronizado con el tipo Locale.
   */
  const postUrl = getLocalizedHref(`/blog/${slug}`, lang);

  /**
   * LOCALIZACIÓN DE FECHAS (Pilar VI)
   * Utiliza la API nativa de internacionalización para paridad de diseño.
   */
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

  /**
   * RESOLUCIÓN DE ASSETS (Pilar VIII - Resiliencia)
   * Prioridad: Prop manual > Asset del CMS > Fallback local.
   */
  const finalImageUrl = useMemo(() => {
    return customImage || post.ogImage || `/images/blog/${slug}.jpg`;
  }, [customImage, post.ogImage, slug]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-900/20 backdrop-blur-sm",
        "transition-all duration-700 hover:border-primary/30 hover:shadow-3xl transform-gpu",
        className
      )}
    >
      {/* 1. CAPA VISUAL (Media Sanctuary & Core Web Vitals) */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <Image
          src={finalImageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
          priority={priority}
          // Pilar X: Optimización Next.js 15
          {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })}
        />
        
        {/* Gradiente de profundidad de lujo */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />
        
        {/* TAXONOMÍA (Tags Flotantes) */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2">
           {post.tags.slice(0, 2).map((tag) => (
             <span 
               key={tag}
               className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-primary"
             >
               <Sparkles size={10} className="animate-pulse" />
               {tag}
             </span>
           ))}
        </div>
      </div>

      {/* 2. CAPA NARRATIVA (DNA Editorial) */}
      <div className="flex grow flex-col p-8 md:p-10">
        <div className="mb-6 flex items-center gap-6 text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-zinc-700" /> 
            <time dateTime={post.published_date}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-zinc-700" /> {post.author}
          </div>
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight text-white mb-5 transition-colors group-hover:text-primary">
          <Link href={postUrl} className="after:absolute after:inset-0 outline-none">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm md:text-base text-zinc-500 font-sans font-light leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* 3. CAPA DE CONVERSIÓN (Sovereign Footer) */}
      <footer className="relative z-30 border-t border-white/5 p-8 bg-white/2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-white transition-all group-hover:text-primary">
          {ctaText} 
          <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>
        <div className="flex gap-2 opacity-20 group-hover:opacity-100 transition-opacity duration-700">
            <TagIcon size={14} className="text-zinc-600" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </footer>

      {/* Efecto de cristal perimetral (MEA/UX) */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-1000" />
    </motion.article>
  );
}