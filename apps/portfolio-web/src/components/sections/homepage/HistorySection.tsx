/**
 * @file HistorySection.tsx
 * @description Aparato de cierre narrativo con síntesis digital (The Legacy).
 *              Refactorizado: Erradicación total de hardcoding, sincronización Day-First, 
 *              vignetage adaptativo y trazabilidad Heimdall.
 * @version 2.4 - Zero Hardcode & Atmosphere Master
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import LetterGlitch from '../../razBits/LetterGlitch';
import { cn } from '../../../lib/utils/cn';
import type { HistorySectionDictionary } from '../../../lib/schemas/history_section.schema';

/**
 * @interface HistorySectionProps
 */
interface HistorySectionProps {
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Mapeo al contrato nivelado v1.2. 
   */
  dictionary: HistorySectionDictionary;
  className?: string;
}

/**
 * APARATO: HistorySection
 * @description Punto final de la narrativa de marca. Reacciona a la atmósfera global.
 */
export function HistorySection({ dictionary, className }: HistorySectionProps) {
  
  /**
   * PROTOCOLO HEIMDALL: Telemetría de Cierre
   * @pilar IV: Registra la impresión del legado para análisis de comportamiento.
   */
  useEffect(() => {
    console.log('[HEIMDALL][UX] HistorySection: Sovereign Legacy calibrated.');
  }, []);

  // Guardia de Resiliencia ante datos nulos (Pilar VIII)
  if (!dictionary?.title || !dictionary?.subtitle || !dictionary?.badge_label) return null;

  return (
    <section 
      /**
       * @pilar VII: Theming Soberano
       * Sincronizado con variables semánticas Oxygen.
       */
      className={cn(
        "relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-background flex items-center justify-center transition-colors duration-1000",
        className
      )}
      aria-labelledby="history-title"
    >
      {/* 1. CAPA DE SÍNTESIS VISUAL: Glitch Engine 
          Adaptamos la opacidad mediante selectores de atributo para evitar parpadeos.
      */}
      <div className="absolute inset-0 z-0 opacity-20 [data-theme='dark']:opacity-40 select-none pointer-events-none transition-opacity duration-1000">
        <LetterGlitch
          glitchColors={['#4a044e', '#86198f', '#c026d3', '#2e1065']}
          glitchSpeed={80}
          smooth={true}
          outerVignette={true}
          centerVignette={true}
        />
      </div>

      {/* 2. CAPA NARRATIVA (DNA del Legado) */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="max-w-4xl mx-auto space-y-10"
        >
          <header className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.6em] text-primary uppercase block animate-pulse">
              {dictionary.badge_label}
            </span>
            <h2 
              id="history-title" 
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tighter leading-[0.85] transition-colors duration-1000"
            >
              {dictionary.title}
            </h2>
          </header>

          <p className="max-w-2xl mx-auto text-lg md:text-2xl text-muted-foreground font-sans font-light leading-relaxed transition-colors duration-1000">
            {dictionary.subtitle}
          </p>

          {/* Artefacto decorativo: Divisor adaptativo */}
          <div className="flex justify-center pt-8">
            <div className="h-20 w-px bg-linear-to-b from-primary/60 to-transparent opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* 
          VIGNETAGE ESTRUCTURAL ADAPTATIVO (Pilar XII)
          Asegura la fusión con el fondo global eliminando bordes duros.
      */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background pointer-events-none transition-colors duration-1000" />
    </section>
  );
}