/**
 * @file BlogCard3D.tsx
 * @description Aparato de visualización híbrida avanzada (WebGL/HTML). 
 *              Refactorizado: Sincronización con Shaper v14.0, 100% Data-Driven
 *              y blindaje contra colisiones de compilador en Next.js 15.
 * @version 13.0 - Elite Hybrid Architecture
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSpring, a as a3d } from '@react-spring/three';
import { a as aDom } from '@react-spring/web';
import { Html as DreiHtml } from '@react-three/drei';
import type { ThreeEvent, ThreeElements } from '@react-three/fiber';
import Image from 'next/image';
import { ArrowRight, Sparkles, User, Calendar } from 'lucide-react';
import * as THREE from 'three';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import type { PostWithSlug } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * Definición de propiedades extendidas.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
type BlogCard3DProps = {
  /** Entidad editorial normalizada por el Shaper polimórfico */
  post: PostWithSlug;
  /** Contexto de idioma para navegación SEO-Friendly */
  lang: string;
  /** Etiqueta de acción (vía diccionario) */
  ctaText: string;
  /** Etiqueta de categoría por defecto (vía diccionario) */
  tagLabel: string;
} & ThreeElements['group'];

/**
 * APARATO: BlogCard3D
 * @description Renderiza una tarjeta interactiva dentro de un entorno WebGL 2.0.
 */
export function BlogCard3D({ 
  post, 
  lang, 
  ctaText, 
  tagLabel,
  ...props 
}: BlogCard3DProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { metadata, slug } = post;

  /**
   * RESOLUCIÓN DE ACTIVO VISUAL (Pilar I)
   * Prioriza la imagen procesada por el CMS o construye el fallback basado en slug.
   */
  const imageUrl = useMemo(() => {
    return metadata.ogImage || `/images/blog/${slug}.jpg`;
  }, [metadata.ogImage, slug]);

  /**
   * FORMATEO DE FECHA LOCALIZADO (Pilar VI)
   */
  const formattedDate = useMemo(() => {
    return new Date(metadata.published_date).toLocaleDateString(lang, { 
      day: '2-digit', month: 'short' 
    });
  }, [metadata.published_date, lang]);

  /**
   * CONFIGURACIÓN DE FÍSICAS LUXURY
   * @pilar XII: MEA/UX - Transiciones suaves con react-spring.
   */
  const { scale, opacity, positionZ } = useSpring({
    scale: isHovered ? 1.08 : 1,
    opacity: isHovered ? 1 : 0.9,
    positionZ: isHovered ? 0.5 : 0,
    config: { mass: 2, tension: 180, friction: 28 },
  });

  /**
   * MANEJADORES DE RAYCASTING (Pilar VIII)
   */
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    router.push(`/${lang}/blog/${slug}`);
  };

  return (
    <a3d.group
      {...props}
      scale={scale}
      position-z={positionZ}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* CAPA DE COLISIÓN (Invisible pero necesaria para el Raycaster) */}
      <mesh>
        <planeGeometry args={[3.2, 4.5]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* PROYECCIÓN HÍBRIDA (DOM dentro de WebGL) */}
      <DreiHtml
        transform
        occlude="blending"
        center
        distanceFactor={4.2}
        className="w-[320px] h-[450px] select-none pointer-events-none"
      >
        <aDom.div
          style={{ opacity }}
          className={cn(
            "group flex h-full flex-col overflow-hidden rounded-[3rem] border transition-all duration-700",
            "bg-zinc-950/95 shadow-3xl",
            isHovered ? "border-purple-500/50 shadow-purple-500/20" : "border-white/5"
          )}
        >
          {/* 1. VISUAL LAYER (Media Library Integrated) */}
          <div className="relative h-56 w-full overflow-hidden shrink-0">
            <Image
              src={imageUrl}
              alt={metadata.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="320px"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
            
            <div className="absolute top-6 left-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                <Sparkles size={10} className="animate-pulse" />
                {metadata.tags[0] || tagLabel}
              </span>
            </div>
          </div>

          {/* 2. TYPOGRAPHY LAYER (Data-Driven) */}
          <div className="flex grow flex-col p-8 bg-zinc-950/50">
            <div className="flex items-center gap-4 text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-4">
               <div className="flex items-center gap-1.5"><User size={10} /> {metadata.author}</div>
               <div className="flex items-center gap-1.5"><Calendar size={10} /> {formattedDate}</div>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight text-white line-clamp-2 group-hover:text-purple-300 transition-colors duration-500 mb-4">
              {metadata.title}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 font-sans font-light">
              {metadata.description}
            </p>
          </div>

          {/* 3. ACTION FOOTER (i18n Compliant) */}
          <div className="border-t border-white/5 p-6 flex justify-between items-center bg-white/2">
            <div className="text-[9px] font-bold text-white group-hover:text-purple-400 transition-all duration-500 flex items-center gap-2 uppercase tracking-[0.3em]">
              {ctaText} 
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover:bg-purple-500 transition-colors" />
          </div>

          {/* Efecto de acabado de lujo */}
          <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-1000" />
        </aDom.div>
      </DreiHtml>
    </a3d.group>
  );
}