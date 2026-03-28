/**
 * @file ValuePropositionSection.tsx
 * @description Orquestador de la Propuesta de Valor (Pillares + Amenidades + Testimonio).
 *              Fase 6 del Embudo: Justificación Lógica y Cierre de Confianza.
 *              Refactorizado: Sincronización total con el Manifiesto Day-First, 
 *              eliminación de hardcoding y optimización de atmósfera.
 * @version 8.0 - Atmosphere Synchronized Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
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
 * MAPA DE ICONOS ESTRATÉGICO (SSoT)
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
 * @description Punto de validación de estándares. Reacciona dinámicamente a la atmósfera.
 */
export function ValuePropositionSection({ dictionary, className }: ValuePropositionSectionProps) {
  
  /**
   * PROTOCOLO HEIMDALL: Telemetría de Fase
   * @pilar IV: Registra la entrada del usuario al bloque de justificación lógica.
   */
  useEffect(() => {
    console.log('[HEIMDALL][UX] ValueProposition: Social proof & Standards synchronized.');
  }, []);

  /**
   * GUARDIÁN DE RESILIENCIA (Pilar VIII)
   */
  if (!dictionary?.pillars || dictionary.pillars.length !== 3) {
    console.error('[HEIMDALL][DATA] Integrity violation in ValueProposition pillars.');
    return null;
  }

  return (
    <section 
      /**
       * @pilar VII: Theming Soberano
       * Sustituimos fondo negro fijo por 'bg-background' y habilitamos transición fluida.
       */
      className={cn(
        "relative w-full py-24 sm:py-40 bg-background overflow-hidden selection:bg-primary/30 transition-colors duration-1000", 
        className
      )}
      aria-label={dictionary.title}
    >
      {/* 1. MARQUEE DE AMENIDADES (Validación Visual) */}
      <div className="mb-32">
        <AmenitiesMarquee dictionary={dictionary} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* 2. HEADER NARRATIVO INSTITUCIONAL */}
        <header className="mx-auto max-w-4xl text-center mb-24 md:mb-36">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold tracking-[0.6em] text-primary uppercase mb-6 block"
          >
            {dictionary.badge_label}
          </motion.span>
          <h2 className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-foreground mb-10 leading-[0.9] transition-colors duration-1000">
            {dictionary.title}
          </h2>
          <p className="text-muted-foreground text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light italic transition-colors duration-1000">
            {dictionary.subtitle}
          </p>
        </header>

        {/* 3. GRID DE PILARES (Arquitectura Adaptativa) */}
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
          initial={{ opacity: 0, scale: 0.98, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
           {/* Efecto de resplandor ambiental adaptativo (Pilar XII) */}
           <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full pointer-events-none transition-opacity duration-1000" />
           
           <TestimonialCard 
            quote={dictionary.testimonial.quote}
            authorName={dictionary.testimonial.author_name}
            authorRole={dictionary.testimonial.author_role}
            avatarSrc={dictionary.testimonial.avatar_url}
          />
        </motion.div>
      </div>

      {/* ELEMENTO ATMOSFÉRICO: Gradiente de Cierre (Día: Transparente | Noche: Inmersivo) */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-primary/5 to-transparent pointer-events-none transition-colors duration-1000" />
    </section>
  );
}