/**
 * @file LiveStatusTicker.tsx
 * @description Aparato de Telemetría de Hospitalidad en Vivo (The Pulse).
 *              Orquesta actualizaciones de estado del hotel y festival mediante loops infinitos.
 *              Nivelado: Corrección de linter, optimización de clases Tailwind y limpieza de assets.
 * @version 5.1 - Linter & Tailwind Canonical Sync
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../lib/utils/cn';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { 
  SystemStatusItem, 
  StatusIconType, 
  StatusColorType 
} from '../../../lib/schemas/system_status.schema';

/**
 * MAPAS SOBERANOS DE ESTILO
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

const COLOR_MAP: Record<StatusColorType, string> = {
  purple: "text-purple-500",
  yellow: "text-yellow-400",
  green: "text-green-400",
  pink: "text-pink-500",
  blue: "text-blue-400",
  cyan: "text-cyan-400",
};

/**
 * SUB-APARATO ATÓMICO: StatusItem
 * @description Renderiza una cápsula individual de telemetría con efectos MEA/UX.
 */
const StatusItem = ({ item }: { item: SystemStatusItem }) => {
  const Icon = ICON_MAP[item.iconKey] || LucideIcons.Info;
  const colorClass = COLOR_MAP[item.colorKey] || "text-zinc-400";

  return (
    <div className="flex items-center gap-10 px-16 group cursor-default">
      <div className="flex flex-col">
        {/* Etiqueta de Categoría con indicación "Live" */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn("h-1 w-1 rounded-full animate-pulse", colorClass.replace('text-', 'bg-'))} />
          <span className={cn(
            "text-[9px] font-mono font-bold tracking-[0.4em] uppercase opacity-40 transition-opacity duration-700 group-hover:opacity-100", 
            colorClass
          )}>
            {item.category}
          </span>
        </div>
        
        {/* Mensaje Principal */}
        <div className="flex items-center gap-4">
          <Icon 
            size={18} 
            strokeWidth={1.5}
            className={cn("transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12", colorClass)} 
          />
          <span className="text-sm font-bold text-zinc-200 uppercase tracking-widest whitespace-nowrap font-sans transition-colors group-hover:text-white">
            {item.message}
          </span>
        </div>
      </div>
      
      {/* Separador de Bucle */}
      <div className="ml-8 h-8 w-px bg-white/5 group-hover:bg-purple-500/20 transition-colors duration-700" />
    </div>
  );
};

/**
 * Hook de Hidratación de Élite (Pilar VIII)
 * @description Detecta el montaje en cliente de forma segura para evitar parpadeos de UI.
 */
const useIsMounted = () => useSyncExternalStore(
  useCallback(() => {
    /**
     * @pilar X: Higiene. 
     * Función de suscripción estática. No requiere limpieza de eventos
     * en el ciclo de vida del cliente tras la hidratación inicial.
     */
    return () => {
      /* No-op para cumplir con @typescript-eslint/no-empty-function */
    };
  }, []), 
  () => true, 
  () => false
);

/**
 * APARATO PRINCIPAL: LiveStatusTicker
 */
export function LiveStatusTicker({ dictionary }: { dictionary: Dictionary['system_status'] }) {
  const isMounted = useIsMounted();
  const trackRef = useRef<HTMLDivElement>(null);

  /**
   * ORQUESTACIÓN DE ANIMACIÓN (GSAP High Performance Engine)
   */
  useInfiniteCarouselAnimation([
    { ref: trackRef, duration: 140, direction: 1 }
  ]);

  /**
   * ESTRATEGIA DE BUCLE INFINITO
   */
  const items = useMemo(() => dictionary?.items || [], [dictionary?.items]);
  const loopedItems = useMemo(() => 
    items.length > 0 ? Array(6).fill(items).flat() : [], 
  [items]);

  // @pilar VIII: Resiliencia - Fallback de altura fija (Pilar X: Prevención de CLS)
  if (!isMounted || items.length === 0) {
    return (
      <div 
        className="h-24 w-full bg-[#050505] border-y border-white/5 animate-pulse" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <section 
      className="relative w-full border-y border-white/5 bg-[#050505] overflow-hidden select-none"
      aria-label={dictionary.aria_label}
    >
      {/* VIGNETAGE SOBERANO */}
      <div className="absolute left-0 top-0 z-20 h-full w-40 bg-linear-to-r from-[#050505] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-20 h-full w-40 bg-linear-to-l from-[#050505] to-transparent pointer-events-none" />

      {/* CONTENEDOR DE MOVIMIENTO */}
      <div 
        ref={trackRef} 
        className="flex items-center w-max py-7 will-change-transform"
      >
        {loopedItems.map((item: SystemStatusItem, index) => (
          <StatusItem 
            key={`${item.category}-${index}`} 
            item={item} 
          />
        ))}
      </div>

      {/* Efecto de Profundidad Atmosférica */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-purple-500/10 to-transparent" />
    </section>
  );
}