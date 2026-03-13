/**
 * @file apps/portfolio-web/src/components/ui/SystemStatusTicker.tsx
 * @description Ticker global de estado del sistema ubicado en el shell principal (Layout).
 *              Implementa animación CSS de alto rendimiento y tipado estricto.
 * @version 3.0 - Object Schema Compatible
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import type { SystemStatusItem } from '../../lib/schemas/system_status.schema';

type SystemStatusTickerProps = {
  /** Fragmento del diccionario validado por Zod */
  dictionary: Dictionary['system_status'];
};

/**
 * Aparato de UI: SystemStatusTicker
 * Provee información en tiempo real con un desplazamiento infinito suave.
 */
export function SystemStatusTicker({ dictionary }: SystemStatusTickerProps) {
  // @pilar VIII: Resiliencia. Si no hay datos, evitamos el renderizado de un contenedor vacío.
  if (!dictionary?.items || dictionary.items.length === 0) return null;

  /**
   * ESTRATEGIA DE BUCLE (Loop Optimization)
   * Duplicamos los elementos para garantizar que el ticker nunca muestre un vacío 
   * en pantallas con resoluciones Ultra-Wide.
   */
  const items = dictionary.items;
  const loopedItems = [...items, ...items, ...items, ...items];

  return (
    <div
      className="relative z-40 w-full overflow-hidden border-b border-white/10 bg-[#050505] py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-sans"
      role="marquee"
      aria-label={dictionary.aria_label}
    >
      {/* CAPA DE DIFUMINADO (Masking): Suaviza la entrada y salida de texto */}
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-[#050505] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-[#050505] to-transparent pointer-events-none" />

      {/* CONTENEDOR ANIMADO: Utiliza la animación 'infinite-scroll' definida en global.css */}
      <div
        className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused] will-change-transform"
        style={{ animationDuration: '120s' }}
      >
        {loopedItems.map((item: SystemStatusItem, index) => (
          <div key={`${item.category}-${index}`} className="flex items-center mx-12 group cursor-default">
            {/* Indicador de pulso boutique */}
            <span className="mr-4 text-[8px] text-purple-600 animate-pulse">●</span>
            
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-zinc-600 font-mono tracking-widest">{item.category}:</span>
              <span className="text-zinc-200 transition-colors group-hover:text-purple-400">
                {item.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}