/**
 * @file apps/portfolio-web/src/components/ui/BlogCard3D.tsx
 * @description Aparato de visualización híbrida avanzada (WebGL/HTML). 
 *              Orquesta la fusión entre React Three Fiber y el DOM de Next.js.
 *              Sincronizado con la Media Library y libre de colisiones de compilador.
 * @version 11.1 - Compiler Collision Fix (DreiHtml Alias)
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSpring, a as a3d } from '@react-spring/three';
import { a as aDom } from '@react-spring/web';
/**
 * @pilar I: Resolución de Colisión de Compilador.
 * Renombramos el componente 'Html' de Drei a 'DreiHtml' para evitar que el 
 * escáner de Next.js lo confunda con 'next/document' durante el build de Vercel.
 */
import { Html as DreiHtml } from '@react-three/drei';
import type { ThreeEvent, ThreeElements } from '@react-three/fiber';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import * as THREE from 'three';

/**
 * IMPORTACIONES NIVELADAS
 */
import type { PostWithSlug } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * Definición de propiedades extendidas.
 * @pilar III: Props explícitas y tipado estricto.
 */
type BlogCard3DProps = {
  /** Objeto de datos del artículo saneado por el Shaper */
  post: PostWithSlug;
  /** Contexto de idioma para la navegación soberana */
  lang: string;
  /** Etiqueta localizada para el call-to-action */
  ctaText: string;
  /** URL de imagen opcional desde la Media Library del CMS */
  customImage?: string;
} & ThreeElements['group'];

/**
 * Aparato Visual: BlogCard3D
 */
export function BlogCard3D({ 
  post, 
  lang, 
  ctaText, 
  customImage,
  ...props 
}: BlogCard3DProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  /**
   * RESOLUCIÓN DE ACTIVO VISUAL (Pilar I)
   */
  const imageUrl = useMemo(() => {
    return customImage || `/images/blog/${post.slug}.jpg`;
  }, [customImage, post.slug]);

  /**
   * CONFIGURACIÓN DE FÍSICAS LUXURY
   * @pilar XII: MEA/UX - Inercia premium.
   */
  const { scale, opacity, positionZ } = useSpring({
    scale: isHovered ? 1.08 : 1,
    opacity: isHovered ? 1 : 0.9,
    positionZ: isHovered ? 0.5 : 0,
    config: { 
      mass: 2, 
      tension: 180, 
      friction: 28 
    },
  });

  /**
   * MANEJADORES DE RAYCASTING SOBERANOS
   * @pilar VIII: Resiliencia ante entornos sin objeto 'document'.
   */
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'auto';
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // @pilar V: Navegación determinista
    router.push(`/${lang}/blog/${post.slug}`);
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
      {/* CAPA DE COLISIÓN */}
      <mesh>
        <planeGeometry args={[3.2, 4.5]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 
         PROYECCIÓN HÍBRIDA SANEADA
         Usamos el alias DreiHtml para eludir la restricción de Next.js.
      */}
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
            "group flex h-full flex-col overflow-hidden rounded-[2.5rem] border transition-all duration-700",
            "bg-zinc-950/95 shadow-3xl",
            isHovered 
              ? "border-purple-500/50 shadow-purple-500/10" 
              : "border-white/5"
          )}
        >
          {/* Visual Hook: Portada Editorial */}
          <div className="relative h-56 w-full overflow-hidden shrink-0">
            <Image
              src={imageUrl}
              alt={post.metadata.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="320px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
            
            <div className="absolute top-6 left-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                <Sparkles size={10} className="animate-pulse" />
                {post.metadata.tags[0] || 'Sanctuary'}
              </span>
            </div>
          </div>

          {/* Typography Layer */}
          <div className="flex grow flex-col p-8">
            <h3 className="font-display text-2xl font-bold leading-tight text-white line-clamp-2 group-hover:text-purple-300 transition-colors duration-500 mb-4">
              {post.metadata.title}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 font-sans font-light">
              {post.metadata.description}
            </p>
          </div>

          {/* Action Footer */}
          <div className="border-t border-white/5 p-6 flex justify-between items-center bg-white/2">
            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
              {post.metadata.published_date}
            </span>
            <div className="text-[10px] font-bold text-white group-hover:text-purple-400 transition-all duration-500 flex items-center gap-2 uppercase tracking-widest">
              {ctaText} 
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 pointer-events-none transition-colors duration-1000" />
        </aDom.div>
      </DreiHtml>
    </a3d.group>
  );
}