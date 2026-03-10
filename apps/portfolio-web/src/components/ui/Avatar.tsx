// RUTA: apps/portfolio-web/src/components/ui/Avatar.tsx
// VERSIÓN: 2.0 - Avatar de Élite (Fallback Inteligente & Style Merge)
// DESCRIPCIÓN: Componente de identidad con soporte para fallback de iniciales,
//              fusión de clases segura con `cn` y optimización de medios.

'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils/cn';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden bg-zinc-800 text-zinc-400 select-none',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
      size: {
        sm: 'h-10 w-10 text-xs',
        md: 'h-16 w-16 text-sm',
        lg: 'h-24 w-24 text-base',
        xl: 'h-32 w-32 text-lg',
      },
    },
    defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  }
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  videoSrc?: string;
  alt: string;
  fallbackName?: string; // Nuevo: Nombre para generar iniciales si src falla
  className?: string;
}

/**
 * Avatar de Élite: Renderiza identidad visual con soporte para fallback de iniciales,
 * video optimizado o imagen optimizada por Next/Image.
 */
export function Avatar({
  src,
  videoSrc,
  alt,
  fallbackName,
  shape,
  size,
  className,
}: AvatarProps) {
  
  // Extrae las iniciales del nombre (ej: "Raz Podestá" -> "RP")
  const initials = useMemo(() => {
    if (!fallbackName) return null;
    return fallbackName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [fallbackName]);

  return (
    <div className={cn(avatarVariants({ shape, size }), className)}>
      {videoSrc ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 64px, 128px"
          className="object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      ) : (
        <span className="font-bold tracking-tight uppercase">{initials}</span>
      )}
    </div>
  );
}