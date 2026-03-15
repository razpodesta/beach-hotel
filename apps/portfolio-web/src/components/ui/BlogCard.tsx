/**
 * @file apps/portfolio-web/src/components/ui/BlogCard.tsx
 * @description Aparato visual de élite para artículos. 
 *              Refactorizado para Build-Safety: Protección de hidratación integrada.
 * @version 4.3 - Linter Compliant
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, User, Image as ImageIcon } from 'lucide-react';

import type { BlogPost } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * Hook de Hidratación Atómica para evitar errores de renderizado en servidor.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => {
      // Intencionalmente vacío: Estado de montaje estático en cliente.
      // Comentario necesario para satisfacer la regla 'no-empty-function' de ESLint.
    };
  }, []);

  return useSyncExternalStore(subscribe, () => true, () => false);
}

interface BlogCardProps {
  post: BlogPost;
  slug: string;
  lang: string;
  ctaText: string;
  customImage?: string;
  priority?: boolean;
  className?: string;
}

export function BlogCard({ 
  post, 
  slug, 
  lang, 
  ctaText, 
  customImage,
  priority = false,
  className 
}: BlogCardProps) {
  const isMounted = useIsMounted();
  const postUrl = `/${lang}/blog/${slug}`;

  const finalImageUrl = useMemo(() => {
    return customImage || `/images/blog/${slug}.jpg`;
  }, [customImage, slug]);

  // Si no está montado, renderizamos un esqueleto estático para el build estático
  if (!isMounted) {
    return (
      <article className={cn("flex flex-col h-full rounded-[2.5rem] bg-zinc-900 border border-white/5 opacity-50", className)}>
        <div className="aspect-video w-full bg-zinc-800 rounded-t-[2.5rem]" />
        <div className="p-8">
            <div className="h-6 w-3/4 bg-zinc-800 rounded mb-4" />
            <div className="h-4 w-full bg-zinc-800 rounded" />
        </div>
      </article>
    );
  }

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
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={finalImageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 brightness-[0.85] group-hover:brightness-100"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute top-6 left-6 z-10">
           <span className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-100">
             <div className="h-1 w-1 rounded-full bg-purple-500 animate-pulse" />
             {post.tags[0] || 'Exclusive'}
           </span>
        </div>
      </div>

      <div className="flex grow flex-col p-8 md:p-10">
        <div className="mb-6 flex items-center gap-6 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-purple-500/70" />
            <span>{post.published_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-pink-500/70" />
            <span>{post.author}</span>
          </div>
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight text-white mb-4">
          <Link href={postUrl} className="outline-none focus:underline after:absolute after:inset-0 after:z-20">
            {post.title}
          </Link>
        </h3>

        <p className="grow line-clamp-3 text-sm leading-relaxed text-zinc-500 font-sans font-light">
          {post.description}
        </p>
      </div>

      <div className="relative z-30 border-t border-white/5 p-8 bg-white/2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 group-hover:text-white transition-colors duration-500">
            {ctaText} 
            <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
          
          {customImage && (
            <span title="Managed Media Asset" className="cursor-help">
              <ImageIcon size={12} className="text-zinc-700" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-700" />
    </motion.article>
  );
}