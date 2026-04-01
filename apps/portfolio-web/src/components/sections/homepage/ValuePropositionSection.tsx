/**
 * @file ValuePropositionSection.tsx
 * @description Orquestador de la Propuesta de Valor.
 *              Refactorizado: Blindaje de tipos contra 'implicit any',
 *              corrección de contratos A11Y y sanitización de datos SSoT.
 * @version 9.0 - Build Resilience Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';

import { cn } from '../../../lib/utils/cn';
import { PillarCard } from '../../ui/PillarCard';
import { AmenitiesMarquee } from './AmenitiesMarquee';
import { TestimonialCard } from '../../ui/TestimonialCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface ValuePropositionSectionProps {
  dictionary: Dictionary['value_proposition'];
  className?: string;
}

const PILLAR_ICONS = ['pin', 'users', 'sparkles'] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export function ValuePropositionSection({ dictionary, className }: ValuePropositionSectionProps) {
  
  useEffect(() => {
    console.log('[HEIMDALL][UX] ValueProposition: Social proof & Standards synchronized.');
  }, []);

  // Guardia de Resiliencia: validación contra la estructura de dictionary.schema
  if (!dictionary?.pillars || dictionary.pillars.length !== 3) {
    return null;
  }

  return (
    <section 
      className={cn(
        "relative w-full py-24 sm:py-40 bg-background overflow-hidden selection:bg-primary/30 transition-colors duration-1000", 
        className
      )}
      aria-label={dictionary.title}
    >
      <div className="mb-32">
        <AmenitiesMarquee dictionary={dictionary} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        <header className="mx-auto max-w-4xl text-center mb-24 md:mb-36">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold tracking-[0.6em] text-primary uppercase mb-6 block"
          >
            {dictionary.badge_label}
          </motion.span>
          <h2 className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-foreground mb-10 leading-[0.9]">
            {dictionary.title}
          </h2>
          <p className="text-muted-foreground text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light italic">
            {dictionary.subtitle}
          </p>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 mb-40"
        >
          {dictionary.pillars.map((pillar: { title: string; description: string }, index: number) => (
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

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
           <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
           
           <TestimonialCard 
            quote={dictionary.testimonial.quote}
            authorName={dictionary.testimonial.author_name}
            authorRole={dictionary.testimonial.author_role}
            avatarSrc={dictionary.testimonial.avatar_url}
          />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-primary/5 to-transparent pointer-events-none" />
    </section>
  );
}