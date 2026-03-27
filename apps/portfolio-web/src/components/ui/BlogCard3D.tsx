/**
 * @file apps/portfolio-web/src/components/ui/BlogCard3D.tsx
 * @description Aparato editorial de alta fidelidad con profundidad cinemática.
 *              Refactorizado: Migración de WebGL a Framer Motion 3D para erradicar
 *              el error de contexto R3F y optimizar el rendimiento (Pilar X).
 * @version 14.0 - DOM-Native 3D Evolution (Vercel Build Fix)
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, User, Calendar } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import type { PostWithSlug } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * @interface BlogCard3DProps
 * @description Contrato de propiedades alineado con el Shaper de Dominio.
 */
interface BlogCard3DProps {
  /** Entidad editorial normalizada */
  post: PostWithSlug;
  /** Contexto de idioma para rumbos SEO */
  lang: string;
  /** Etiqueta de acción inyectada */
  ctaText: string;
  /** Etiqueta de categoría por defecto */
  tagLabel: string;
  className?: string;
}

/**
 * APARATO: BlogCard3D
 * @description Renderiza una tarjeta editorial con efecto de inclinación (Tilt) 3D nativo.
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
   * Implementa una rotación basada en la posición del puntero.
   */
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Suavizado de movimiento (Spring)
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  // Mapeo de coordenadas a grados de rotación
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  /**
   * RESOLUCIÓN DE ACTIVO VISUAL
   */
  const imageUrl = useMemo(() => {
    return metadata.ogImage || `/images/blog/${slug}.jpg`;
  }, [metadata.ogImage, slug]);

  const formattedDate = useMemo(() => {
    return new Date(metadata.published_date).toLocaleDateString(lang, { 
      day: '2-digit', month: 'short' 
    });
  }, [metadata.published_date, lang]);

  /**
   * MANEJADORES DE INTERACCIÓN
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;

    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
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
        "relative w-[320px] h-[450px] group cursor-pointer perspective-1000",
        className
      )}
    >
      <Link href={`/${lang}/blog/${slug}`} className="block h-full w-full outline-none">
        <div 
          className={cn(
            "relative h-full w-full flex flex-col overflow-hidden rounded-[3rem] border transition-all duration-700",
            "bg-zinc-950/95 shadow-3xl",
            "border-white/5 group-hover:border-primary/40 group-hover:shadow-primary/20"
          )}
          style={{ transform: "translateZ(0px)" }} // Forzar aceleración hardware
        >
          {/* 1. VISUAL LAYER (Media Library) */}
          <div className="relative h-56 w-full overflow-hidden shrink-0">
            <Image
              src={imageUrl}
              alt={metadata.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="320px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
            
            <div 
              className="absolute top-6 left-6"
              style={{ transform: "translateZ(40px)" }} // Efecto Parallax interno
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles size={10} className="animate-pulse" />
                {metadata.tags[0] || tagLabel}
              </span>
            </div>
          </div>

          {/* 2. TYPOGRAPHY LAYER (Data-Driven) */}
          <div className="flex grow flex-col p-8 bg-zinc-950/50" style={{ transform: "translateZ(30px)" }}>
            <div className="flex items-center gap-4 text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-4">
               <div className="flex items-center gap-1.5"><User size={10} /> {metadata.author}</div>
               <div className="flex items-center gap-1.5"><Calendar size={10} /> {formattedDate}</div>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight text-white line-clamp-2 group-hover:text-primary transition-colors duration-500 mb-4">
              {metadata.title}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 font-sans font-light">
              {metadata.description}
            </p>
          </div>

          {/* 3. ACTION FOOTER */}
          <div className="border-t border-white/5 p-6 flex justify-between items-center bg-white/2">
            <div className="text-[9px] font-bold text-white group-hover:text-primary transition-all duration-500 flex items-center gap-2 uppercase tracking-[0.3em]">
              {ctaText} 
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover:bg-primary transition-colors" />
          </div>

          {/* Acabado de Lujo: Borde interior sutil */}
          <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-1000" />
        </div>
      </Link>
    </motion.div>
  );
}