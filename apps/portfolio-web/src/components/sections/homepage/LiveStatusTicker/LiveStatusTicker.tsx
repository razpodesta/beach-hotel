/**
 * @file LiveStatusTicker.tsx
 * @description Orquestador de Telemetría Ambiental (The Pulse).
 *              Refactorizado: Resolución de avisos de linter y eliminación de código muerto.
 * @version 6.1 - Linter Hardening & Hygiene Compliance
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import { useInfiniteCarouselAnimation } from '../../../../lib/hooks/use-infinite-carousel-animation';
import { StatusItem } from './StatusItem';
import type { Dictionary } from '../../../../lib/schemas/dictionary.schema';

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @pilar VIII: Resiliencia - Detección determinista de cliente.
 * @description Utiliza la suscripción atómica al DOM para evitar Hydration Mismatch.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    /**
     * @description Función de limpieza obligatoria para satisfacer el linter.
     * El estado de montaje es terminal en el ciclo de vida del cliente.
     */
    return () => {
      /* No-op cleanup */
    };
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: LiveStatusTicker
 * @description Realiza el renderizado del Ticker global con optimización de CLS.
 */
export function LiveStatusTicker({ dictionary }: { dictionary: Dictionary['system_status'] }) {
  const isMounted = useIsMounted();
  const trackRef = useRef<HTMLDivElement>(null);

  /**
   * MOTOR DE ANIMACIÓN (GSAP High Performance)
   * @description El orquestador duplica los nodos para el bucle infinito mediante GPU.
   */
  useInfiniteCarouselAnimation([
    { ref: trackRef, duration: 140, direction: 1 }
  ]);

  const items = useMemo(() => dictionary?.items || [], [dictionary?.items]);
  
  /**
   * ESTRATEGIA DE BUCLE MASIVO
   * @description Garantiza cobertura total en resoluciones Ultra-Wide (4K/8K).
   */
  const loopedItems = useMemo(() => 
    items.length > 0 ? Array(6).fill(items).flat() : [], 
  [items]);

  /**
   * SKELETON DE SEGURIDAD (Anti-CLS)
   * @pilar X: Altura nivelada a 82px para evitar saltos de layout tras la hidratación.
   */
  if (!isMounted || items.length === 0) {
    return (
      <div 
        className="h-[82px] w-full bg-[#050505] border-y border-white/5 animate-pulse" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <section 
      className="relative w-full border-y border-white/5 bg-[#050505] overflow-hidden select-none"
      role="region"
      aria-label={dictionary.aria_label}
    >
      {/* MÁSCARAS DE DIFUMINADO (Luxury Vignetage) */}
      <div className="absolute left-0 top-0 z-20 h-full w-40 bg-linear-to-r from-[#050505] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-20 h-full w-40 bg-linear-to-l from-[#050505] to-transparent pointer-events-none" />

      {/* TRACK DE MOVIMIENTO SOBERANO */}
      <div 
        ref={trackRef} 
        className="flex items-center w-max py-7 will-change-transform"
      >
        {loopedItems.map((item, index) => (
          <StatusItem 
            key={`${item.category}-${index}`} 
            item={item} 
          />
        ))}
      </div>

      {/* ACENTO ATMOSFÉRICO INFERIOR */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/10 to-transparent" />
    </section>
  );
}