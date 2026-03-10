// RUTA: apps/portfolio-web/src/components/ui/PillarCard.tsx
// VERSIÓN: 4.1 - Icon Mapping Extendido
// DESCRIPCIÓN: Se amplía el mapa de iconos para soportar tanto la página de
//              Misión/Visión como la Homepage, unificando la API mediante strings.

'use client';

import { motion, type Variants } from 'framer-motion';
import { cva } from 'class-variance-authority';
// Importamos TODOS los iconos necesarios para las diferentes secciones
import {
  BookOpen,
  BrainCircuit,
  Goal,
  Blocks,
  Sparkles,
  TrendingUp,
  LucideIcon
} from 'lucide-react';

// Mapa maestro de iconos disponibles para PillarCard
const ICON_MAP: Record<string, LucideIcon> = {
  // Misión y Visión
  'book-open': BookOpen,
  'brain-circuit': BrainCircuit,
  'goal': Goal,
  // Homepage (Value Proposition)
  'blocks': Blocks,
  'sparkles': Sparkles,
  'trending-up': TrendingUp,
};

type PillarCardProps = {
  iconName: string; // API unificada basada en strings (RSC Safe)
  title: string;
  description: string;
  sequence: number;
  className?: string;
};

const cardStyle = cva(
  "relative flex h-full flex-col p-8 overflow-hidden rounded-2xl bg-zinc-900/50 border transition-all duration-400 group",
  {
    variants: {
      sequence: {
        default: "border-zinc-800",
        highlighted: "border-pink-500/30 shadow-2xl shadow-pink-500/10",
      },
      size: {
        1: "md:mt-16",
        2: "md:mt-8",
        3: "md:mt-0",
      }
    },
    defaultVariants: {
      sequence: "default",
    }
  }
);

const pillarVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export function PillarCard({ iconName, title, description, sequence, className = '' }: PillarCardProps) {
  const formattedSequence = sequence.toString().padStart(2, '0');

  // Resolución segura con fallback a 'blocks' si no se encuentra
  const Icon = ICON_MAP[iconName] || Blocks;

  return (
    <motion.div
      variants={pillarVariants}
      className={`${cardStyle({
        sequence: sequence === 3 ? 'highlighted' : 'default',
        size: sequence as 1 | 2 | 3
      })} ${className} hover:border-pink-500/60 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/20`}
    >
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-purple-900/40 to-pink-900/40 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" aria-hidden="true" />
      <div className="absolute top-4 right-6 font-display text-7xl font-bold text-zinc-800/80 transition-colors duration-300 group-hover:text-zinc-700/80">
        {formattedSequence}
      </div>
      <div className="relative z-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 mb-6 border border-zinc-700 transition-all duration-300 group-hover:border-pink-500/50 group-hover:bg-zinc-800">
          <Icon className="h-8 w-8 text-zinc-400 transition-colors duration-300 group-hover:text-pink-400" />
        </div>
        <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-zinc-400">{description}</p>
      </div>
    </motion.div>
  );
}
