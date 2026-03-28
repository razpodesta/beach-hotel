/**
 * @file BlogCard3D.tsx
 * @description Aparato editorial 3D de alta fidelidad con inteligencia atmosférica.
 *              Orquesta transformaciones espaciales y resplandores dinámicos 
 *              basados en el 'vibe' del contenido (Day/Night).
 * @version 15.0 - Atmosphere & Depth Perception Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, User, Calendar, Clock } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import type { PostWithSlug } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * @interface BlogCard3DProps
 * @description Contrato de propiedades alineado con el Shaper de Dominio v29.0.
 */
interface BlogCard3DProps {
  /** Entidad editorial normalizada con metadatos de atmósfera */
  post: PostWithSlug;
  /** Contexto de idioma para rumbos SEO */
  lang: string;
  /** Etiqueta de acción inyectada vía diccionario */
  ctaText: string;
  /** Etiqueta de categoría por defecto (Fallback) */
  tagLabel: string;
  className?: string;
}

/**
 * APARATO: BlogCard3D
 * @description Renderiza una tarjeta editorial con profundidad física y reactividad lumínica.
 */
export function BlogCard3D({ 
  post, 
  lang, 
  ctaText, 
  tagLabel,
  className 
}: BlogCard3DProps) {
  const { metadata, slug } = post;

  /**
   * MOTOR DE INERCIA FÍSICA (Pilar XII - MEA/UX)
   * Gestiona la rotación y profundidad basada en el puntero.
   */
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 120, damping: 25 });
  const mouseY = useSpring(y, { stiffness: 120, damping: 25 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);

  /**
   * LÓGICA DE ATMÓSFERA SOBERANA (Pilar VII)
   * Night: Neón Rosa (Accent) | Day: Lavanda (Primary)
   */
  const isNight = metadata.vibe === 'night';
  
  const atmosphere = useMemo(() => ({
    accent: isNight ? 'text-accent' : 'text-primary',
    glow: isNight ? 'shadow-accent/20 border-accent/30' : 'shadow-primary/20 border-primary/30',
    badge: isNight ? 'bg-accent/10 border-accent/20' : 'bg-primary/10 border-primary/20',
    indicator: isNight ? 'bg-accent shadow-[0_0_10px_var(--color-accent)]' : 'bg-primary shadow-[0_0_10px_var(--color-primary)]'
  }), [isNight]);

  const finalImageUrl = metadata.ogImage || `/images/blog/${slug}.jpg`;

  const formattedDate = useMemo(() => {
    return new Date(metadata.published_date).toLocaleDateString(lang, { 
      day: '2-digit', month: 'short' 
    });
  }, [metadata.published_date, lang]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set( (e.clientX - rect.left) / rect.width - 0.5 );
    y.set( (e.clientY - rect.top) / rect.height - 0.5 );
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative w-[320px] h-[480px] group cursor-pointer perspective-1000",
        className
      )}
    >
      <Link href={`/${lang}/blog/${slug}`} className="block h-full w-full outline-none">
        <div 
          className={cn(
            "relative h-full w-full flex flex-col overflow-hidden rounded-[3.5rem] border transition-all duration-700",
            "bg-surface/90 backdrop-blur-xl shadow-3xl",
            "border-border group-hover:bg-surface",
            isNight ? "group-hover:border-accent/40" : "group-hover:border-primary/40"
          )}
          style={{ transform: "translateZ(0px)" }}
        >
          {/* 1. MEDIA LAYER (Depth: 50px) */}
          <div className="relative h-60 w-full overflow-hidden shrink-0">
            <Image
              src={finalImageUrl}
              alt={metadata.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="320px"
              priority={false}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90" />
            
            {/* ATMOSPHERE BADGE */}
            <div 
              className="absolute top-8 left-8"
              style={{ transform: "translateZ(50px)" }}
            >
              <span className={cn(
                "inline-flex items-center gap-2 rounded-full backdrop-blur-2xl border px-4 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em]",
                atmosphere.accent,
                atmosphere.badge
              )}>
                <Sparkles size={10} className={cn(isNight && "animate-pulse")} />
                {metadata.tags[0] || tagLabel}
              </span>
            </div>
          </div>

          {/* 2. CONTENT LAYER (Depth: 30px) */}
          <div className="flex grow flex-col p-10" style={{ transform: "translateZ(30px)" }}>
            <div className="flex items-center gap-5 text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-5">
               <div className="flex items-center gap-1.5"><User size={10} /> {metadata.author}</div>
               <div className="flex items-center gap-1.5"><Calendar size={10} /> {formattedDate}</div>
               {metadata.readingTime && (
                 <div className="flex items-center gap-1.5 text-primary/60"><Clock size={10} /> {metadata.readingTime}m</div>
               )}
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight text-foreground line-clamp-2 transition-colors duration-500 mb-5 group-hover:text-foreground/90">
              {metadata.title}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground font-sans font-light">
              {metadata.description}
            </p>
          </div>

          {/* 3. INTERACTIVE FOOTER */}
          <div className="border-t border-border p-8 flex justify-between items-center bg-background/20 backdrop-blur-sm">
            <div className={cn(
              "text-[9px] font-bold transition-all duration-500 flex items-center gap-3 uppercase tracking-[0.3em]",
              isNight ? "group-hover:text-accent" : "group-hover:text-primary"
            )}>
              {ctaText} 
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
            </div>
            <div className={cn(
              "h-2 w-2 rounded-full transition-all duration-700",
              atmosphere.indicator
            )} />
          </div>

          {/* ACABADO DE LUJO: Resplandor Interior Perimetral */}
          <div className={cn(
            "absolute inset-0 border border-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 rounded-[3.5rem]",
            isNight ? "shadow-[inset_0_0_40px_oklch(70%_0.15_320/0.1)]" : "shadow-[inset_0_0_40px_oklch(65%_0.25_270/0.1)]"
          )} />
        </div>
      </Link>
    </motion.div>
  );
}