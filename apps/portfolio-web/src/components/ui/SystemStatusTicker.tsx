/**
 * @file SystemStatusTicker.tsx
 * @description Ticker global de telemetría ubicado en el Shell Maestro.
 *              Refactorizado: Sincronización con Oxygen Engine (OKLCH),
 *              eliminación de hardcoding cromático y corrección crítica de Reglas de Hooks.
 * @version 4.2 - Rules of Hooks Compliance
 * @author Raz Podestá - MetaShark Tech
 */

import React, { useMemo } from 'react';
import { cn } from '../../lib/utils/cn';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import type { SystemStatusItem } from '../../lib/schemas/system_status.schema';

interface SystemStatusTickerProps {
  /** Fragmento del diccionario validado por MACS */
  dictionary: Dictionary['system_status'];
}

/**
 * APARATO: SystemStatusTicker
 * @description Provee el "latido" del sistema en el perímetro del layout.
 */
export function SystemStatusTicker({ dictionary }: SystemStatusTickerProps) {
  /**
   * OPTIMIZACIÓN DE BUCLE (Pilar X)
   * Movemos el hook al nivel superior del componente para cumplir las Reglas de Hooks.
   * Si dictionary o items no existen, el array vacío resultará en un renderizado nulo seguro.
   */
  const loopedItems = useMemo(() => {
    if (!dictionary?.items || dictionary.items.length === 0) return [];
    const base = dictionary.items;
    return [...base, ...base, ...base];
  }, [dictionary?.items]);

  // Guardia de Resiliencia (Pilar VIII)
  if (loopedItems.length === 0) return null;

  return (
    <div
      className={cn(
        "relative z-40 w-full overflow-hidden border-b border-border bg-background py-2.5",
        "text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans transition-colors duration-1000"
      )}
      role="marquee"
      aria-label={dictionary.aria_label}
    >
      {/* CAPAS DE DIFUMINADO ADAPTATIVO */}
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-background to-transparent pointer-events-none" />

      {/* MOTOR DE ANIMACIÓN CSS (Oxygen Track) */}
      <div
        className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused] will-change-transform transform-gpu"
        style={{ animationDuration: '140s' }}
      >
        {loopedItems.map((item: SystemStatusItem, index) => (
          <div key={`${item.category}-${index}`} className="flex items-center mx-12 group cursor-default">
            {/* Indicador de Pulso Semántico */}
            <span className="mr-4 text-[8px] text-primary animate-pulse">●</span>
            
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-muted-foreground/60 font-mono tracking-widest">{item.category}:</span>
              
              <span className="text-foreground transition-colors group-hover:text-primary">
                {item.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}