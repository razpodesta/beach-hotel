/**
 * @file ValuePropositionSection.tsx
 * @description Orquestador de la Propuesta de Valor (Pillares + Amenidades + Testimonio).
 *              Fase 6 del Embudo: Justificación Lógica y Cierre de Confianza.
 *              Refactorizado: 100% Data-Driven, Eliminación de Hardcoding y Regresiones.
 * @version 7.0 - Elite Conversion Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../lib/utils/cn';
import { PillarCard } from '../../ui/PillarCard';
import { AmenitiesMarquee } from './AmenitiesMarquee';
import { TestimonialCard } from '../../ui/TestimonialCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface ValuePropositionSectionProps
 */
interface ValuePropositionSectionProps {
  /** Fragmento nivelado del diccionario aplanado */
  dictionary: Dictionary['value_proposition'];
  className?: string;
}

/** 
 * MAPA DE ICONOS ESTRATÉGICO
 */
const PILLAR_ICONS = ['pin', 'users', 'sparkles'] as const;

/**
 * COREOGRAFÍA MEA/UX (Pilar XII)
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

/**
 * APARATO: ValuePropositionSection
 * @description Sella la decisión de reserva mediante evidencia de estándares y testimonios.
 */
export function ValuePropositionSection({ dictionary, className }: ValuePropositionSectionProps) {
  
  /**
   * GUARDIÁN DE RESILIENCIA (Pilar VIII)
   */
  if (!dictionary?.pillars || dictionary.pillars.length !== 3) {
    console.error('[HEIMDALL][DATA] ValuePropositionSection: Integrity violation.');
    return null;
  }

  return (
    <section 
      className={cn("relative w-full py-24 sm:py-40 bg-[#020202] overflow-hidden selection:bg-primary/30", className)}
      aria-label={dictionary.title}
    >
      {/* 1. MARQUEE DE AMENIDADES (Validación Visual) */}
      <div className="mb-32">
        <AmenitiesMarquee dictionary={dictionary} />
      </div>

      <div className="container mx-auto px-6">
        
        {/* 2. HEADER NARRATIVO INSTITUCIONAL */}
        <header className="mx-auto max-w-4xl text-center mb-24 md:mb-36">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-bold tracking-[0.6em] text-primary uppercase mb-6 block"
          >
            {dictionary.badge_label}
          </motion.span>
          <h2 className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-white mb-10 leading-[0.9]">
            {dictionary.title}
          </h2>
          <p className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light italic">
            {dictionary.subtitle}
          </p>
        </header>

        {/* 3. GRID DE PILARES (Arquitectura Lego) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 mb-40"
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

        {/* 4. PRUEBA SOCIAL: TESTIMONIAL DE ÉLITE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
           {/* Efecto de fondo para destacar el testimonio */}
           <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
           
           <TestimonialCard 
            quote={dictionary.testimonial.quote}
            authorName={dictionary.testimonial.author_name}
            authorRole={dictionary.testimonial.author_role}
            avatarSrc={dictionary.testimonial.avatar_url}
          />
        </motion.div>
      </div>

      {/* ELEMENTO ATMOSFÉRICO: Gradiente de Cierre */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-primary/5 to-transparent pointer-events-none" />
    </section>
  );
}