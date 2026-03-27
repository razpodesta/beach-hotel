/**
 * @file apps/portfolio-web/src/components/ui/BlogCard.tsx
 * @description Aparato editorial de alta fidelidad. 
 *              Orquesta la visualización de artículos con enfoque en Core Web Vitals,
 *              SEO semántico e interacciones de grado boutique.
 * @version 9.0 - Vercel Build Normalization & Asset Resilience
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Calendar, 
  User, 
  Tag as TagIcon,
  Image as ImageIcon 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Saneadas)
 * @pilar V: Eliminación de extensiones físicas para resolución nativa en Next.js 15.
 */
import type { BlogPost } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * @interface BlogCardProps
 * @description Contrato de propiedades alineado con el Shaper de Dominio.
 */
interface BlogCardProps {
  /** Metadatos del artículo validados por el esquema soberano */
  post: BlogPost;
  /** Identificador semántico para la construcción de rumbos */
  slug: string;
  /** Contexto de idioma para localización de rutas */
  lang: string;
  /** Etiqueta de acción inyectada vía diccionario */
  ctaText: string;
  /** URL de imagen opcional para sobrescribir el asset del CMS */
  customImage?: string;
  /** Optimización LCP: Carga prioritaria si el componente está sobre el pliegue */
  priority?: boolean;
  className?: string;
}

/**
 * APARATO: BlogCard
 * @description Renderiza una cápsula editorial con profundidad visual y jerarquía clara.
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
  
  // Resolución de rumbos soberanos (SEO Friendly)
  const postUrl = `/${lang}/blog/${slug}`;

  /**
   * LOCALIZACIÓN DE FECHAS
   * @pilar VI: i18n Nativa utilizando APIs del motor de JS.
   */
  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang, {
        day: '2-digit', 
        month: 'long', 
        year: 'numeric'
      }).format(new Date(post.published_date));
    } catch {
      return post.published_date;
    }
  }, [post.published_date, lang]);

  /**
   * GESTIÓN RESILIENTE DE ASSETS (Pilar VIII)
   * Prioridad: Prop manual > Asset del CMS > Slug local > Placeholder Global.
   */
  const finalImageUrl = useMemo(() => {
    return customImage || post.ogImage || `/images/blog/${slug}.jpg` || '/images/hotel/og-main.jpg';
  }, [customImage, post.ogImage, slug]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-sm",
        "transition-all duration-500 hover:border-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(168,85,247,0.15)]",
        className
      )}
    >
      {/* 1. CAPA VISUAL (CLS Optimized) */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <Image
          src={finalImageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        
        {/* Overlay de profundidad cinemática */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80" />
        
        {/* TAXONOMÍA ACTIVA: Vinculación con archivo por etiquetas */}
        <div className="absolute top-6 left-6 z-30 flex flex-wrap gap-2">
           {post.tags.slice(0, 2).map((tag) => (
             <Link 
               key={tag}
               href={`/${lang}/blog/tag/${tag.toLowerCase().trim().replace(/\s+/g, '-')}`}
               aria-label={`Ver artigos sobre ${tag}`}
               className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-300 hover:text-white hover:border-primary/50 transition-all outline-none focus-visible:ring-1 focus-visible:ring-primary"
             >
               <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
               {tag}
             </Link>
           ))}
        </div>
      </div>

      {/* 2. CUERPO NARRATIVO */}
      <div className="flex grow flex-col p-8 md:p-10 relative">
        <div className="mb-6 flex items-center gap-6 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-primary" /> 
            <time dateTime={post.published_date}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-pink-500" /> {post.author}
          </div>
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-bold leading-[1.1] text-white mb-5 group-hover:text-primary transition-colors duration-500">
          <Link href={postUrl} className="after:absolute after:inset-0 after:z-20 outline-none">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm md:text-base text-zinc-400 font-sans font-light leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* 3. FOOTER DE ACCIÓN (Conversion Zone) */}
      <div className="relative z-30 border-t border-white/5 p-8 bg-white/2 flex items-center justify-between">
        <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-white group-hover:text-primary transition-all">
          {ctaText} 
          <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </span>
        <div className="flex items-center gap-4 text-zinc-800 transition-colors group-hover:text-zinc-600">
            <TagIcon size={14} />
            <ImageIcon size={14} />
        </div>
      </div>

      {/* Acabado de Lujo: Borde interior sutil */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-1000" />
    </motion.article>
  );
}