/**
 * @file HistorySection.tsx
 * @description Aparato de cierre narrativo con síntesis digital.
 *              Nivelado: Adaptación a jerarquía plana del Dictionary y eliminación de regresión TS2339.
 * @version 2.2 - Sovereign Dictionary Mapping
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import LetterGlitch from '../../razBits/LetterGlitch';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface HistorySectionProps {
  /** 
   * @pilar III: Seguridad de Tipos. 
   * Mapeo directo al aparato soberano 'history'. 
   */
  dictionary: Dictionary['history'];
  className?: string;
}

/**
 * Aparato Visual: HistorySection
 */
export function HistorySection({ dictionary, className }: HistorySectionProps) {
  // @pilar VIII: Resiliencia - Guardia ante datos nulos o incompletos para el Build
  if (!dictionary?.title || !dictionary?.subtitle) return null;

  return (
    <section 
      className={cn(
        "relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-black flex items-center justify-center",
        className
      )}
      aria-labelledby="history-title"
    >
      {/* CAPA DE SÍNTESIS VISUAL: Glitch Engine */}
      <div className="absolute inset-0 z-0 opacity-40 select-none pointer-events-none">
        <LetterGlitch
          glitchColors={['#4a044e', '#86198f', '#c026d3', '#2e1065']}
          glitchSpeed={80}
          smooth={true}
          outerVignette={true}
          centerVignette={true}
        />
      </div>

      {/* CAPA NARRATIVA */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ 
            duration: 1, 
            ease: [0.16, 1, 0.3, 1] // Easing Premium (Luxury feel)
          }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <header className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.6em] text-purple-500 uppercase block animate-pulse">
              The Legacy
            </span>
            <h2 
              id="history-title" 
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-[0.9]"
            >
              {dictionary.title}
            </h2>
          </header>

          <p className="max-w-2xl mx-auto text-lg md:text-2xl text-zinc-400 font-sans font-light leading-relaxed">
            {dictionary.subtitle}
          </p>

          {/* Artefacto decorativo: Divisor minimalista */}
          <div className="flex justify-center pt-8">
            <div className="h-16 w-px bg-linear-to-b from-purple-500 to-transparent opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Vignetage estructural para sellar la sección */}
      <div className="absolute inset-0 bg-linear-to-b from-black via-transparent to-black pointer-events-none" />
    </section>
  );
}