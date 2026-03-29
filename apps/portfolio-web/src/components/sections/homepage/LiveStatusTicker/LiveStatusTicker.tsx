/**
 * @file LiveStatusTicker.tsx
 * @description Orquestador del carrusel de telemetría infinita (Heimdall Core).
 *              Implementa animación CSS de alto rendimiento, duplicación de nodos 
 *              para loops sin costuras y reactividad atmosférica.
 * @version 5.0 - GPU Accelerated Loop & Build Fix
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '../../../../lib/utils/cn';
import { StatusItem } from './StatusItem';

/**
 * IMPORTACIONES DE CONTRATO (SSoT)
 */
import type { SystemStatusDictionary } from '../../../../lib/schemas/system_status.schema';

/**
 * @interface LiveStatusTickerProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface LiveStatusTickerProps {
  /** Fragmento del diccionario validado por esquema Zod */
  dictionary: SystemStatusDictionary;
  className?: string;
}

/**
 * APARATO: LiveStatusTicker
 * @description Contenedor soberano que gestiona el flujo de información en tiempo real.
 * @fix Resuelve el error de importación en page.tsx al exportar el miembro correcto.
 */
export function LiveStatusTicker({ dictionary, className }: LiveStatusTickerProps) {
  
  /**
   * ESTRATEGIA DE BUCLE INFINITO (Pilar X)
   * @description Duplicamos los ítems quirúrgicamente para llenar el viewport 
   *              y permitir un retorno al origen invisible para el ojo humano.
   */
  const itemsToRender = useMemo(() => {
    if (!dictionary?.items) return [];
    // Triplicamos la data para asegurar cobertura en monitores Ultra-Wide
    return [...dictionary.items, ...dictionary.items, ...dictionary.items];
  }, [dictionary.items]);

  // Guardia de Resiliencia (Pilar VIII)
  if (!dictionary?.items || dictionary.items.length === 0) return null;

  return (
    <section 
      className={cn(
        "relative w-full overflow-hidden border-y border-border bg-background py-5 transition-colors duration-1000",
        className
      )}
      role="region"
      aria-label={dictionary.aria_label}
    >
      {/* 
          CAPAS DE DIFUMINADO (Masking Layer) 
          @pilar XII: UX - Suaviza la entrada y salida de los datos para una estética boutique.
      */}
      <div className="absolute left-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-20 h-full w-24 md:w-64 bg-linear-to-l from-background to-transparent pointer-events-none" />

      {/* 
          RIEL DE ANIMACIÓN (The Oxygen Track)
          Utiliza la animación 'infinite-scroll' definida en el motor global.css.
          Aceleración por hardware mediante will-change-transform.
      */}
      <div 
        className="flex w-max items-center animate-infinite-scroll hover:[animation-play-state:paused] will-change-transform transform-gpu"
        style={{ animationDuration: '140s' }} // Velocidad de lectura confortable
      >
        {itemsToRender.map((item, index) => (
          <StatusItem 
            key={`${item.category}-${index}`} 
            item={item} 
          />
        ))}
      </div>

      {/* 
          INDICADOR DE ESTADO (Telemetría de Red)
          Sincronizado con el lenguaje de diseño de infraestructura.
      */}
      <div className="absolute bottom-1 right-8 z-30 opacity-10 pointer-events-none">
         <span className="text-[7px] font-mono font-bold tracking-[0.4em] text-foreground uppercase">
           Sovereign Telemetry Active
         </span>
      </div>
    </section>
  );
}