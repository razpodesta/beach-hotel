/**
 * @file BlogCard3D - Tarjeta Editorial Híbrida (WebGL/DOM).
 * @version 9.0 - MetaShark Elite Standard
 * @description Componente de visualización avanzada que fusiona geometría 3D con 
 *              contenido HTML accesible. Utiliza 'react-spring' para físicas de 
 *              movimiento y 'Drei Html' para renderizado de texto semántico.
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

// ALIAS SOBERANO (@/* mapea a apps/portfolio-web/src/*)
import type { PostWithSlug } from '@/lib/schemas/blog.schema';
import { cn } from '@/lib/utils/cn';

/**
 * Propiedades extendidas de Three.js para soporte de posicionamiento en el Canvas.
 */
type BlogCard3DProps = {
  post: PostWithSlug;
  lang: string;
  ctaText: string;
} & ThreeElements['group'];

/**
 * Aparato de Visualización: BlogCard3D
 * Integra lógica de raycasting para detección de puntero y resortes físicos para escala.
 */
export function BlogCard3D({ post, lang, ctaText, ...props }: BlogCard3DProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Configuración de resortes (Físicas de lujo)
  const { scale, opacity } = useSpring({
    scale: isHovered ? 1.1 : 1,
    opacity: isHovered ? 1 : 0.85,
    config: { 
      mass: 1, 
      tension: 280, 
      friction: 20 
    },
  });

  // Gestores de eventos WebGL (Raycasting)
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
    // Navegación fluida hacia la ruta dinámica
    router.push(`/${lang}/blog/${post.slug}`);
  };

  // Memorización de la ruta de imagen para evitar re-calculos
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
         HITBOX: Mesh invisible que actúa como plano de colisión. 
         Garantiza que el click sea capturado en toda el área de la tarjeta.
      */}
      <mesh>
        <planeGeometry args={[3.2, 4.4]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 
         INTERFAZ DOM: Proyectada mediante matriz de transformación 3D.
         'occlude' permite que otras geometrías tapen la tarjeta correctamente.
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
            "group flex h-full flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 bg-zinc-950/90 shadow-2xl",
            isHovered 
              ? "border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]" 
              : "border-white/5"
          )}
        >
          {/* Capa Visual: Imagen de Portada */}
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

          {/* Capa Informativa: Contenido Editorial */}
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

          {/* Capa de Acción: Footer de Tarjeta */}
          <div className="border-t border-white/5 p-5 flex justify-between items-center bg-white/[0.02]">
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