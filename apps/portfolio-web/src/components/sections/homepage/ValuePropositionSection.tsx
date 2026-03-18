/**
 * @file ValuePropositionSection.tsx
 * @description Orquestador de la Propuesta de Valor (Pillares + Amenidades + Testimonio).
 *              Nivelado: Validaciones de seguridad de tipos y resiliencia de renderizado.
 * @version 5.2 - Contract Enforcement & Resilience
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '../../../lib/utils/cn';
import { PillarCard } from '../../ui/PillarCard';
import { AmenitiesMarquee } from './AmenitiesMarquee';
import { TestimonialCard } from '../../ui/TestimonialCard';
import { type ValuePropositionDictionary } from '../../../lib/schemas/value_proposition.schema';

interface ValuePropositionSectionProps {
  /** Diccionario validado por el esquema soberano */
  dictionary: ValuePropositionDictionary;
  className?: string;
}

/** Mapa de iconos vinculado a la secuencia de pilares */
const PILLAR_ICONS = ['pin', 'users', 'sparkles'] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export function ValuePropositionSection({ dictionary, className }: ValuePropositionSectionProps) {
  // @pilar VIII: Resiliencia - Guardia de seguridad ante datos incompletos
  if (!dictionary?.pillars || dictionary.pillars.length !== 3) {
    console.error('[HEIMDALL][DATA] ValuePropositionSection: Incomplete pillars data.');
    return null;
  }

  return (
    <section 
      className={cn("relative w-full py-24 sm:py-32 bg-[#020202] overflow-hidden", className)}
      aria-labelledby="value-prop-title"
    >
      {/* 1. MARQUEE DE AMENIDADES */}
      <div className="mb-24">
        <AmenitiesMarquee dictionary={dictionary} />
      </div>

      <div className="container mx-auto px-6">
        
        {/* 2. ENCABEZADO NARRATIVO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center mb-20 md:mb-32"
        >
          <span className="text-[10px] font-bold tracking-[0.6em] text-purple-500 uppercase mb-4 block">
            The Sanctuary Standards
          </span>
          <h2 id="value-prop-title" className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8">
            {dictionary.title}
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light italic">
            {dictionary.subtitle}
          </p>
        </motion.div>

        {/* 3. GRID DE PILARES */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-32"
        >
          {dictionary.pillars.map((pillar, index) => (
            <PillarCard
              key={`pillar-${index}`}
              iconName={PILLAR_ICONS[index] ?? 'sparkles'}
              title={pillar.title}
              description={pillar.description}
              sequence={index + 1}
              className="h-full"
            />
          ))}
        </motion.div>

        {/* 4. PRUEBA SOCIAL (TESTIMONIAL) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <TestimonialCard 
            quote={dictionary.testimonial.quote}
            authorName={dictionary.testimonial.author_name}
            authorRole={dictionary.testimonial.author_role}
            avatarSrc="/images/hotel/guest-avatar-placeholder.jpg"
          />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-purple-500/2 to-transparent pointer-events-none" />
    </section>
  );
}