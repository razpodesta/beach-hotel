/**
 * @file apps/portfolio-web/src/components/ui/BlogCard.tsx
 * @description Aparato visual de élite para la representación de artículos. 
 *              Implementa semántica HTML5, optimización de estilos Tailwind v4 
 *              y animaciones físicas fluidas.
 * @version 3.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, User } from 'lucide-react';

/**
 * IMPORTACIONES NIVELADAS (Cumplimiento @nx/enforce-module-boundaries)
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
  /** Clases adicionales para el orquestador externo */
  className?: string;
}

/**
 * Aparato de UI: BlogCard
 * Orquesta una experiencia visual inmersiva con feedback táctil y visual.
 */
export function BlogCard({ post, slug, lang, ctaText, className }: BlogCardProps) {
  const imageUrl = `/images/blog/${slug}.jpg`;
  const postUrl = `/${lang}/blog/${slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-4xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm",
        "transition-all duration-500 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/5",
        className
      )}
    >
      {/* 1. CAPA VISUAL (Visual Hook) */}
      <Link 
        href={postUrl} 
        className="relative block aspect-video w-full overflow-hidden outline-none" 
        aria-label={`${ctaText}: ${post.title}`}
      >
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />
        
        {/* Badge de Taxonomía */}
        <div className="absolute top-6 left-6">
           <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
             {post.tags[0] || 'Editorial'}
           </span>
        </div>
      </Link>

      {/* 2. CAPA INFORMATIVA */}
      <div className="flex grow flex-col p-8">
        <div className="mb-4 flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-1.5" title="Fecha de publicación">
            <Calendar size={12} className="text-purple-500" />
            <span>{post.published_date}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Autor">
            <User size={12} className="text-pink-500" />
            <span>{post.author}</span>
          </div>
        </div>

        <h3 className="font-display text-2xl font-bold leading-tight text-white transition-colors group-hover:text-purple-300">
          <Link href={postUrl} className="outline-none focus-visible:underline decoration-purple-500 underline-offset-4">
            {post.title}
          </Link>
        </h3>

        <p className="mt-4 grow line-clamp-3 text-sm leading-relaxed text-zinc-400 font-sans">
          {post.description}
        </p>
      </div>

      {/* 3. CAPA DE ACCIÓN (Footer) */}
      <div className="border-t border-white/5 p-6 bg-white/1">
        <Link 
          href={postUrl} 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 transition-all group-hover:gap-4 group-hover:text-white outline-none"
        >
          {ctaText} 
          <ArrowUpRight 
            size={14} 
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
          />
        </Link>
      </div>
    </motion.article>
  );
}