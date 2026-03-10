// RUTA: apps/portfolio-web/src/components/sections/homepage/ValuePropositionSection.tsx

/**
 * @file Sección de Propuesta de Valor
 * @version 3.0 - Resilient Orchestrator
 * @description Orquestador de tarjetas de pilares. Utiliza animaciones de 
 *              fase para una entrada elegante y semántica de contenido.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';
import { PillarCard } from '../../ui/PillarCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

type ValuePropositionSectionProps = {
  dictionary: Dictionary['homepage']['value_proposition_section'];
  className?: string;
};

// Mapa de iconos soberano. Si el índice excede, el componente PillarCard ya gestiona el fallback.
const PILLAR_ICONS = ['blocks', 'sparkles', 'trending-up'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const connectorVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function ValuePropositionSection({ dictionary, className }: ValuePropositionSectionProps) {
  return (
    <section className={cn("w-full py-20 sm:py-32 overflow-hidden bg-zinc-950/50", className)}>
      <div className="container mx-auto px-4">
        
        {/* Encabezado SEO-Friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center mb-16 md:mb-24"
        >
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {dictionary.title}
          </h2>
          <p className="mt-6 text-lg text-zinc-400">
            {dictionary.subtitle}
          </p>
        </motion.div>

        {/* Orquestador de Pilares */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8"
        >
          {dictionary.pillars.map((pillar, index) => (
            <React.Fragment key={pillar.title}>
              <PillarCard
                iconName={PILLAR_ICONS[index] || 'blocks'}
                title={pillar.title}
                description={pillar.description}
                sequence={index + 1}
                className="flex-1 min-w-0"
              />

              {/* Conector Visual */}
              {index < dictionary.pillars.length - 1 && (
                <motion.div
                  variants={connectorVariants}
                  className="hidden md:flex items-center justify-center"
                >
                  <ChevronRight className="h-10 w-10 text-zinc-800" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}