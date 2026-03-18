/**
 * @file apps/portfolio-web/src/components/ui/BlogCard.tsx
 * @description Aparato editorial de alta fidelidad. 
 *              Orquestación resiliente de activos multimedia con optimización de carga.
 * @version 6.1 - Aliasing Hardened & Linter Compliant
 * @author Raz Podestá - MetaShark Tech
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image'; // Aliasing explícito para evitar colisión
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Calendar, 
  User, 
  Image as ImageIcon // Aliasing de Lucide para evitar colisión con next/image
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import type { BlogPost } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

interface BlogCardProps {
  post: BlogPost;
  slug: string;
  lang: string;
  ctaText: string;
  customImage?: string;
  priority?: boolean;
  className?: string;
}

/**
 * APARATO: BlogCard
 * @description Renderiza una tarjeta editorial inmutable.
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

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang, {
        day: '2-digit', month: 'long', year: 'numeric'
      }).format(new Date(post.published_date));
    } catch {
      return post.published_date;
    }
  }, [post.published_date, lang]);

  const finalImageUrl = useMemo(() => {
    return customImage || `/images/blog/${slug}.jpg`;
  }, [customImage, slug]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-sm",
        "transition-all duration-500 hover:border-purple-500/40 hover:shadow-[0_20px_50px_-20px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      {/* CAPA VISUAL (LCP Optimized) */}
      <div className="relative aspect-video w-full overflow-hidden">
        <NextImage
          src={finalImageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
           <span className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 text-[8px] font-bold uppercase tracking-[0.25em] text-white">
             <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
             {post.tags[0] || 'Concierge'}
           </span>
        </div>
      </div>

      {/* CUERPO EDITORIAL */}
      <div className="flex grow flex-col p-8 md:p-10">
        <div className="mb-4 flex items-center gap-6 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-purple-500" /> {formattedDate}
          </div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-pink-500" /> {post.author}
          </div>
        </div>

        <h3 className="font-display text-2xl font-bold leading-[1.1] text-white mb-4">
          <Link href={postUrl} className="after:absolute after:inset-0 after:z-20 outline-none hover:underline">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm text-zinc-400 font-sans font-light">
          {post.description}
        </p>
      </div>

      {/* FOOTER DE CONVERSIÓN */}
      <div className="relative z-30 border-t border-white/5 p-8 bg-white/1 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
          {ctaText} <ArrowUpRight size={14} />
        </span>
        <ImageIcon size={14} className="text-zinc-700" />
      </div>
    </motion.article>
  );
}