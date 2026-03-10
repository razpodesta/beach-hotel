// RUTA: apps/portfolio-web/src/components/sections/homepage/LiveStatusTicker.tsx

/**
 * @file Ticker de Estado en Tiempo Real
 * @version 2.0 - Arquitectura de Datos Sincronizada
 * @description Ticker infinito optimizado mediante GSAP. 
 *              Consume datos inyectados para permitir actualización vía CMS.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef } from 'react';
import { Ticket, ThermometerSun, ShieldCheck, Music, Users, Waves, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

// Mapeo canónico de iconos para deserialización desde CMS/Dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  Ticket, ThermometerSun, ShieldCheck, Music, Users, Waves, Sparkles
};

// Mapeo de colores semánticos para evitar colisiones con Tailwind
const COLOR_MAP: Record<string, string> = {
  purple: "text-purple-500",
  yellow: "text-yellow-400",
  green: "text-green-400",
  pink: "text-pink-500",
  blue: "text-blue-400",
  cyan: "text-cyan-400",
};

export function LiveStatusTicker({ dictionary }: { dictionary: Dictionary['system_status'] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Activación del motor de animación infinita
  useInfiniteCarouselAnimation([
    { ref: trackRef, duration: 120, direction: 1 }
  ]);

  return (
    <section 
      className="relative w-full border-y border-border bg-background py-8 overflow-hidden select-none"
      aria-label={dictionary.aria_label}
    >
      {/* Vignetage semántico para profundidad */}
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-background to-transparent pointer-events-none" />

      <div ref={trackRef} className="flex items-center w-max will-change-transform">
        {dictionary.items.map((item, index) => {
          // Extraemos metadatos simulando estructura de CMS (puedes ajustar el split según tu JSON)
          const [cat, text, iconKey, colorKey] = item.split('|');
          const Icon = ICON_MAP[iconKey] || Sparkles;
          const colorClass = COLOR_MAP[colorKey] || "text-primary";

          return (
            <div key={`${index}`} className="flex items-center gap-6 px-12 group cursor-default">
              <div className="flex flex-col">
                <span className={cn("text-[8px] font-mono font-bold tracking-[0.3em] uppercase opacity-40 group-hover:opacity-100 transition-opacity", colorClass)}>
                  {cat}
                </span>
                <div className="flex items-center gap-4 mt-1">
                  <Icon size={16} className={colorClass} />
                  <span className="text-sm font-bold text-foreground uppercase tracking-widest whitespace-nowrap">
                    {text}
                  </span>
                </div>
              </div>
              <div className="ml-12 h-1 w-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
            </div>
          );
        })}
      </div>
    </section>
  );
}