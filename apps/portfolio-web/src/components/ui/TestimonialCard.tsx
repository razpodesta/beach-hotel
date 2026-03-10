// RUTA: apps/portfolio-web/src/components/ui/TestimonialCard.tsx
// VERSIÓN: 1.2 - Tipado de Variantes Verificado.
// DESCRIPCIÓN: Se verifica que la constante 'cardVariants' está explícitamente
//              tipada con 'Variants' de Framer Motion, asegurando que TypeScript
//              reconozca 'ease: 'easeOut'' como un valor válido y eliminando
//              errores de compilación de forma proactiva.

'use client';

import { motion, type Variants } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Avatar } from './Avatar';

type TestimonialCardProps = {
  quote: string;
  authorName: string;
  authorRole: string;
  avatarSrc: string;
};

// --- TIPADO VERIFICADO ---
const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export function TestimonialCard({ quote, authorName, authorRole, avatarSrc }: TestimonialCardProps) {
  return (
    <motion.div
      className="relative mx-auto max-w-3xl rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Quote className="absolute top-4 left-4 h-10 w-10 text-zinc-700" aria-hidden="true" />
      <blockquote className="font-sans text-lg italic text-zinc-300 md:text-xl">
        “{quote}”
      </blockquote>
      <figcaption className="mt-8 flex items-center justify-center gap-4">
        <Avatar src={avatarSrc} alt={`Foto de ${authorName}`} size="md" shape="circle" />
        <div className="text-left">
          <p className="font-bold text-white">{authorName}</p>
          <p className="text-sm text-zinc-400">{authorRole}</p>
        </div>
      </figcaption>
      <Quote className="absolute bottom-4 right-4 h-10 w-10 text-zinc-700 transform scale-x-[-1]" aria-hidden="true" />
    </motion.div>
  );
}
