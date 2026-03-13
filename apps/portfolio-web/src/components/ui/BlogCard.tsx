/**
 * @file apps/portfolio-web/src/components/ui/BlogCard.tsx
 * @description Aparato visual de élite para la representación de artículos. 
 *              Implementa integración dinámica con Media Library y accesibilidad WCAG.
 * @version 4.1 - Type Contract Fixed & T4 Canonical Syntax
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, User, Image as ImageIcon } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS
 * @pilar V: Adherencia arquitectónica.
 */
import type { BlogPost } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

interface BlogCardProps {
  /** Metadatos del post validados por el adaptador de CMS */
  post: BlogPost;
  /** Identificador semántico para la construcción de la URL */
  slug: string;
  /** Contexto de idioma activo */
  lang: string;
  /** Texto localizado para el botón de acción */
  ctaText: string;
  /** URL de imagen opcional proveniente del CMS (Prioridad sobre fallback local) */
  customImage?: string;
  /** Indica si es el post principal para optimizar carga (LCP) */
  priority?: boolean;
  /** Clases adicionales para el orquestador externo */
  className?: string;
}

/**
 * Aparato de UI: BlogCard
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
  
  const postUrl = `/${lang}/blog/${slug}`;

  /**
   * @pilar I: Resolución de Activos Visuales.
   * Lógica de precedencia: CMS Media > Local Fallback.
   */
  const finalImageUrl = useMemo(() => {
    if (customImage) return customImage;
    return `/images/blog/${slug}.jpg`;
  }, [customImage, slug]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-sm",
        "transition-all duration-500 hover:border-purple-500/40 hover:shadow-3xl hover:shadow-purple-500/5",
        className
      )}
    >
      {/* 1. CAPA VISUAL (Visual Hook) */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={finalImageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:rotate-1 brightness-[0.85] group-hover:brightness-100"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        
        {/* Gradiente Atmosférico */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
        
        {/* Badge de Taxonomía */}
        <div className="absolute top-6 left-6 z-10">
           <span className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-100">
             <div className="h-1 w-1 rounded-full bg-purple-500 animate-pulse" />
             {post.tags[0] || 'Exclusive'}
           </span>
        </div>
      </div>

      {/* 2. CAPA INFORMATIVA (Narrative) */}
      <div className="flex grow flex-col p-8 md:p-10">
        <div className="mb-6 flex items-center gap-6 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2" aria-label="Fecha de publicación">
            <Calendar size={12} className="text-purple-500/70" />
            <span>{post.published_date}</span>
          </div>
          <div className="flex items-center gap-2" aria-label="Autoría">
            <User size={12} className="text-pink-500/70" />
            <span>{post.author}</span>
          </div>
        </div>

        {/* 
           @pilar XII: MEA/UX. 
           Área de clic integral mediante pseudo-elemento.
        */}
        <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight text-white mb-4">
          <Link 
            href={postUrl} 
            className="outline-none focus:underline decoration-purple-500 underline-offset-8 after:absolute after:inset-0 after:z-20"
          >
            {post.title}
          </Link>
        </h3>

        <p className="grow line-clamp-3 text-sm leading-relaxed text-zinc-500 font-sans font-light">
          {post.description}
        </p>
      </div>

      {/* 3. CAPA DE ACCIÓN (Footer) */}
      <div className="relative z-30 border-t border-white/5 p-8 bg-white/2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 group-hover:text-white transition-colors duration-500">
            {ctaText} 
            <ArrowUpRight 
              size={16} 
              className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" 
            />
          </span>
          
          {/* 
              @pilar III: Resolución de Error TS2322. 
              El atributo 'title' se mueve a un contenedor <span> para 
              cumplir con la interfaz estricta de LucideProps.
          */}
          {customImage && (
            <span title="Managed Media Asset" className="cursor-help">
              <ImageIcon size={12} className="text-zinc-700" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>

      {/* Efecto de Sellado Visual */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-700" />
    </motion.article>
  );
}