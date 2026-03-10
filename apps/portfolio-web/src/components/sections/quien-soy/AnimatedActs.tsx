// apps/portfolio-web/src/components/sections/quien-soy/AnimatedActs.tsx

/**
 * @file Lista Animada de Actos (Isla de Cliente).
 * @version 1.3 - Bulletproof Typing
 */

'use client';

import { motion, type Variants } from 'framer-motion';
import type { Section } from '@/lib/schemas/quien_soy.schema';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.2
    }
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      // SOLUCIÓN DEFINITIVA: 'as const' fuerza el tipo literal "easeOut"
      // en lugar de string, satisfaciendo la unión de tipos de Easing.
      ease: 'easeOut' as const,
    },
  },
};

const ActSection = ({ act, title, description }: { act: string; title: string; description: string }) => (
  <motion.div variants={itemVariants}>
    <h2 className="font-display text-3xl font-bold text-white mb-3">
      {act}: <span className="text-purple-400">{title}</span>
    </h2>
    <p className="font-sans text-lg text-zinc-400 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

export function AnimatedActs({ acts }: { acts: { id: string; content: Section }[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="mx-auto max-w-3xl space-y-16"
    >
      {acts.map((act) => (
        <ActSection
          key={act.id}
          act={`Acto ${act.id}`}
          title={act.content.title}
          description={act.content.description}
        />
      ))}
    </motion.div>
  );
}
