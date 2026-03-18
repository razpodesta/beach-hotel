/**
 * @file apps/portfolio-web/src/components/sections/homepage/LiveStatusTicker.tsx
 * @description Aparato de telemetría en vivo (Ticker).
 *              Nivelado: Eliminada advertencia de linter (no-empty-function), 
 *              mapeo de tipos soberano y prevención de CLS.
 * @version 4.2 - Linter Compliant & Elite Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

import { cn } from '../../../lib/utils/cn';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';

// IMPORTACIONES DE CONTRATO
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { 
  SystemStatusItem, 
  StatusIconType, 
  StatusColorType 
} from '../../../lib/schemas/system_status.schema';

/**
 * MAPEO DE ICONOS SOBERANO
 */
const ICON_MAP: Record<StatusIconType, LucideIcons.LucideIcon> = {
  Ticket: LucideIcons.Ticket,
  ThermometerSun: LucideIcons.ThermometerSun,
  ShieldCheck: LucideIcons.ShieldCheck,
  Music: LucideIcons.Music,
  Users: LucideIcons.Users,
  Waves: LucideIcons.Waves,
  Sparkles: LucideIcons.Sparkles,
};

/**
 * MAPEO DE COLORES SEMÁNTICOS
 */
const COLOR_MAP: Record<StatusColorType, string> = {
  purple: "text-purple-500",
  yellow: "text-yellow-400",
  green: "text-green-400",
  pink: "text-pink-500",
  blue: "text-blue-400",
  cyan: "text-cyan-400",
};

/**
 * @pilar X: Rendimiento. Detecta montaje para evitar discrepancias de animación.
 * Refactorizado para cumplir con @typescript-eslint/no-empty-function.
 */
const useIsMounted = () => useSyncExternalStore(
  useCallback(() => {
    // Función de limpieza estática para el ciclo de vida del cliente
    return () => {
      /* No-op: Estado de montaje inmutable tras hidratación */
    };
  }, []), 
  () => true, 
  () => false
);

export function LiveStatusTicker({ dictionary }: { dictionary: Dictionary['system_status'] }) {
  const isMounted = useIsMounted();
  const trackRef = useRef<HTMLDivElement>(null);

  // Orquestación de animación (GSAP Engine)
  useInfiniteCarouselAnimation([
    { ref: trackRef, duration: 120, direction: 1 }
  ]);

  const items = useMemo(() => dictionary?.items || [], [dictionary?.items]);

  // @pilar VIII: Resiliencia - Fallback de altura exacta para evitar Layout Shift (CLS)
  if (!isMounted || items.length === 0) {
    return (
      <div 
        className="h-[88px] w-full bg-[#050505] border-y border-white/5 animate-pulse" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <section 
      className="relative w-full border-y border-white/5 bg-[#050505] overflow-hidden select-none"
      aria-label={dictionary.aria_label}
      style={{ height: '88px' }}
    >
      {/* Vignetage de suavizado lateral */}
      <div className="absolute left-0 top-0 z-10 h-full w-32 bg-linear-to-r from-[#050505] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-32 bg-linear-to-l from-[#050505] to-transparent pointer-events-none" />

      <div ref={trackRef} className="flex items-center w-max py-6 will-change-transform">
        {/* Renderizado de 4 ciclos para cubrir resoluciones Ultra-Wide sin huecos */}
        {[...items, ...items, ...items, ...items].map((item: SystemStatusItem, index) => {
          const Icon = ICON_MAP[item.iconKey] || Sparkles;
          const colorClass = COLOR_MAP[item.colorKey] || "text-purple-500";

          return (
            <div 
              key={`${item.category}-${index}`} 
              className="flex items-center gap-8 px-16 group cursor-default"
            >
              <div className="flex flex-col">
                <span className={cn(
                  "text-[9px] font-mono font-bold tracking-[0.4em] uppercase opacity-40 transition-opacity duration-500 group-hover:opacity-100", 
                  colorClass
                )}>
                  {item.category}
                </span>
                <div className="flex items-center gap-4 mt-2">
                  <Icon size={18} className={cn("transition-transform duration-500 group-hover:scale-125", colorClass)} />
                  <span className="text-sm font-bold text-zinc-100 uppercase tracking-widest whitespace-nowrap font-sans">
                    {item.message}
                  </span>
                </div>
              </div>
              
              <div className="ml-8 h-1 w-1 rounded-full bg-zinc-800 group-hover:bg-purple-500 transition-colors duration-500" />
            </div>
          );
        })}
      </div>
    </section>
  );
}