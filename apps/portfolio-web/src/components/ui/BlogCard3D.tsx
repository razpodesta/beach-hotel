/**
 * @file BlogCard3D.tsx
 * @description Aparato editorial 3D de alta fidelidad con inteligencia atmosférica.
 *              Orquesta transformaciones espaciales multi-capa y resplandores
 *              dinámicos basados en la inercia del puntero y el 'vibe' del contenido.
 * @version 16.0 - Multi-Layer Parallax & OKLCH Glow Engine
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, User, Calendar, Clock, BookOpen } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a fronteras Nx.
 */
import type { PostWithSlug } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * @interface BlogCard3DProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface BlogCard3DProps {
  /** Entidad editorial validada con metadatos de atmósfera y métricas */
  post: PostWithSlug;
  /** Contexto de idioma para rumbos SEO */
  lang: string;
  /** Etiqueta de acción localizada */
  ctaText: string;
  /** Etiqueta de categoría por defecto */
  tagLabel: string;
  className?: string;
}

/**
 * APARATO: BlogCard3D
 * @description Renderiza una unidad editorial con profundidad física calibrada.
 *              Fase de Embudo: Trust & Authority.
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
   * Calibración de resortes para una respuesta orgánica y sin lag.
   */
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 30 });

  // Transformaciones de Rotación (Eje X e Y invertidos para efecto natural)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  /**
   * LÓGICA DE ATMÓSFERA SOBERANA (Pilar VII)
   * Sincronización con el Oxygen Engine: Lavanda (Day) | Neón Pink (Night).
   */
  const isNight = metadata.vibe === 'night';
  
  const atmosphere = useMemo(() => ({
    accent: isNight ? 'text-accent' : 'text-primary',
    border: isNight ? 'group-hover:border-accent/30' : 'group-hover:border-primary/30',
    badge: isNight ? 'bg-accent/10 border-accent/20' : 'bg-primary/10 border-primary/20',
    glow: isNight 
      ? 'shadow-[0_0_50px_oklch(70%_0.15_320_/_0.15)]' 
      : 'shadow-[0_0_50px_oklch(65%_0.25_270_/_0.1)]',
    indicator: isNight 
      ? 'bg-accent shadow-[0_0_12px_var(--color-accent)]' 
      : 'bg-primary shadow-[0_0_12px_var(--color-primary)]'
  }), [isNight]);

  /**
   * FORMATEO DE METADATOS (Pilar X)
   */
  const formattedDate = useMemo(() => {
    return new Date(metadata.published_date).toLocaleDateString(lang, { 
      day: '2-digit', month: 'short' 
    });
  }, [metadata.published_date, lang]);

  const finalImageUrl = metadata.ogImage || `/images/blog/${slug}.jpg`;

  /**
   * HANDLERS DE INTERACCIÓN
   * @description Normaliza las coordenadas del mouse respecto al centro del componente.
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

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
        "relative w-[340px] h-[520px] group cursor-pointer perspective-2000",
        className
      )}
    >
      <Link href={`/${lang}/blog/${slug}`} className="block h-full w-full outline-none" aria-label={metadata.title}>
        <div 
          className={cn(
            "relative h-full w-full flex flex-col overflow-hidden rounded-[4rem] border transition-all duration-1000",
            "bg-surface/90 backdrop-blur-2xl border-border shadow-3xl",
            atmosphere.border,
            atmosphere.glow
          )}
          style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}
        >
          {/* --- CAPA 1: MEDIA (Depth: 40px) --- */}
          <div 
            className="relative h-64 w-full overflow-hidden shrink-0 transform-gpu"
            style={{ transform: "translateZ(40px)" }}
          >
            <Image
              src={finalImageUrl}
              alt={metadata.title}
              fill
              className="object-cover transition-transform duration-2000] group-hover:scale-110"
              sizes="340px"
              priority={false}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-80" />
            
            {/* ATMOSPHERE BADGE (Depth: 80px) */}
            <div 
              className="absolute top-10 left-10"
              style={{ transform: "translateZ(40px)" }}
            >
              <span className={cn(
                "inline-flex items-center gap-2.5 rounded-full backdrop-blur-[30px] border px-5 py-2 text-[9px] font-bold uppercase tracking-[0.25em]",
                atmosphere.accent,
                atmosphere.badge
              )}>
                <Sparkles size={12} className={cn(isNight && "animate-pulse")} />
                {metadata.tags[0] || tagLabel}
              </span>
            </div>
          </div>

          {/* --- CAPA 2: CONTENT (Depth: 60px) --- */}
          <div 
            className="flex grow flex-col p-12 transform-gpu" 
            style={{ transform: "translateZ(60px)" }}
          >
            {/* Telemetría Editorial */}
            <div className="flex items-center gap-6 text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-6">
               <div className="flex items-center gap-2"><User size={12} className="opacity-40" /> {metadata.author}</div>
               <div className="flex items-center gap-2"><Calendar size={12} className="opacity-40" /> {formattedDate}</div>
               {metadata.readingTime && (
                 <div className="flex items-center gap-2 text-primary/70">
                    <Clock size={12} className="opacity-40" /> {metadata.readingTime}m
                 </div>
               )}
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold leading-[1.1] text-foreground tracking-tighter line-clamp-2 transition-colors duration-500 mb-6 group-hover:text-foreground">
              {metadata.title}
            </h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground font-sans font-light italic">
              {metadata.description}
            </p>
          </div>

          {/* --- CAPA 3: FOOTER (Depth: 20px) --- */}
          <div 
            className="border-t border-border/50 p-10 flex justify-between items-center bg-background/30 backdrop-blur-md transform-gpu"
            style={{ transform: "translateZ(20px)" }}
          >
            <div className={cn(
              "text-[10px] font-bold transition-all duration-500 flex items-center gap-4 uppercase tracking-[0.4em]",
              isNight ? "group-hover:text-accent" : "group-hover:text-primary"
            )}>
              <BookOpen size={16} className="opacity-40" />
              {ctaText} 
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-3" />
            </div>
            
            {/* Latido Sensorial */}
            <div className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-700 animate-pulse",
              atmosphere.indicator
            )} />
          </div>

          {/* ACABADO DE LUJO: Reflejo Especular Perimetral */}
          <div className="absolute inset-0 border border-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 rounded-[4rem] shadow-[inset_0_0_60px_rgba(255,255,255,0.02)]" />
        </div>
      </Link>
    </motion.div>
  );
}