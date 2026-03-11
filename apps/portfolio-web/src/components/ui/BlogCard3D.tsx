/**
 * @file apps/portfolio-web/src/components/ui/BlogCard3D.tsx
 * @description Aparato de visualización híbrida avanzada (WebGL/HTML). 
 *              Utiliza físicas de resorte para profundidad interactiva y 
 *              proyección de contenido semántico mediante Drei Html.
 * @version 10.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSpring, a as a3d } from '@react-spring/three';
import { a as aDom } from '@react-spring/web';
import { Html } from '@react-three/drei';
import type { ThreeEvent, ThreeElements } from '@react-three/fiber';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import * as THREE from 'three';

/**
 * IMPORTACIONES NIVELADAS (Cumplimiento @nx/enforce-module-boundaries)
 */
import type { PostWithSlug } from '../../lib/schemas/blog.schema';
import { cn } from '../../lib/utils/cn';

/**
 * Definición de propiedades extendidas para integración en escena Three.js.
 */
type BlogCard3DProps = {
  /** Objeto de datos del artículo validado por el adaptador CMS */
  post: PostWithSlug;
  /** Contexto de idioma para la navegación */
  lang: string;
  /** Etiqueta localizada para el botón de lectura */
  ctaText: string;
} & ThreeElements['group'];

/**
 * Aparato Visual: BlogCard3D
 * Orquesta la fusión entre el motor de renderizado WebGL y el árbol DOM de React.
 */
export function BlogCard3D({ post, lang, ctaText, ...props }: BlogCard3DProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Configuración de Físicas Inmersivas.
   * La respuesta de resorte proporciona un feedback orgánico de alta gama.
   */
  const { scale, opacity } = useSpring({
    scale: isHovered ? 1.1 : 1,
    opacity: isHovered ? 1 : 0.85,
    config: { 
      mass: 1, 
      tension: 280, 
      friction: 20 
    },
  });

  /**
   * Manejadores de Eventos de Puntero (Raycasting).
   */
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Navegación determinista hacia el detalle editorial
    router.push(`/${lang}/blog/${post.slug}`);
  };

  // Resolución canónica de recursos visuales
  const imageUrl = useMemo(() => `/images/blog/${post.slug}.jpg`, [post.slug]);

  return (
    <a3d.group
      {...props}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 
         CAPA DE COLISIÓN: Mesh invisible para capturar el raycasting 
         de forma precisa en todo el volumen de la tarjeta.
      */}
      <mesh>
        <planeGeometry args={[3.2, 4.4]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 
         INTERFAZ HÍBRIDA: Proyección HTML en espacio 3D.
         'occlude' garantiza que la tarjeta se oculte tras otros objetos 3D.
      */}
      <Html
        transform
        occlude="blending"
        center
        distanceFactor={4}
        className="w-[320px] h-[440px] select-none pointer-events-none"
      >
        <aDom.div
          style={{ opacity }}
          className={cn(
            "group flex h-full flex-col overflow-hidden rounded-4xl border transition-all duration-500 bg-zinc-950/90 shadow-2xl",
            isHovered 
              ? "border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]" 
              : "border-white/5"
          )}
        >
          {/* Visual Hook: Imagen Editorial */}
          <div className="relative h-52 w-full overflow-hidden shrink-0">
            <Image
              src={imageUrl}
              alt={post.metadata.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="320px"
              priority={false}
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
          </div>

          {/* Metadata & Typography Layer */}
          <div className="flex grow flex-col p-8">
            <div className="mb-4">
               <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-purple-400 border border-purple-500/20">
                 {post.metadata.tags[0] || 'Concierge'}
               </span>
            </div>

            <h3 className="font-display text-2xl font-bold leading-tight text-white line-clamp-2 group-hover:text-purple-300 transition-colors mb-4">
              {post.metadata.title}
            </h3>

            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 font-sans">
              {post.metadata.description}
            </p>
          </div>

          {/* Action Footer: Feedback táctil */}
          <div className="border-t border-white/5 p-5 flex justify-between items-center bg-white/2">
            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
              {post.metadata.published_date}
            </span>
            <div className="text-[10px] font-bold text-white group-hover:text-purple-400 transition-all flex items-center gap-2 uppercase tracking-widest">
              {ctaText} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </aDom.div>
      </Html>
    </a3d.group>
  );
}