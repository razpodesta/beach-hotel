// RUTA: apps/portfolio-web/src/components/ui/PillarCard.tsx

/**
 * @file Tarjeta de Pilar (PillarCard)
 * @version 5.0 - Tailwind v4 Standard & Style Merge
 * @description Componente visual para mostrar pilares de valor o misión.
 *              Utiliza `cn()` para una gestión segura de clases y `cva` para variantes.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils/cn';
import * as LucideIcons from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

// Mapa maestro de iconos (Soportado para serialización en Server Components)
const ICON_MAP: Record<string, LucideIcon> = {
  'book-open': LucideIcons.BookOpen,
  'brain-circuit': LucideIcons.BrainCircuit,
  'goal': LucideIcons.Goal,
  'blocks': LucideIcons.Blocks,
  'sparkles': LucideIcons.Sparkles,
  'trending-up': LucideIcons.TrendingUp,
};

const pillarVariants = cva(
  "relative flex h-full flex-col p-8 overflow-hidden rounded-2xl bg-zinc-900/50 border transition-all duration-400 group border-zinc-800",
  {
    variants: {
      isHighlighted: {
        true: "border-pink-500/30 shadow-2xl shadow-pink-500/10",
        false: "border-zinc-800",
      }
    },
    defaultVariants: {
      isHighlighted: false,
    }
  }
);

const animationVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export interface PillarCardProps extends VariantProps<typeof pillarVariants> {
  iconName: string;
  title: string;
  description: string;
  sequence: number;
  className?: string;
}

export function PillarCard({ 
  iconName, 
  title, 
  description, 
  sequence, 
  className 
}: PillarCardProps) {
  const formattedSequence = sequence.toString().padStart(2, '0');
  const Icon = ICON_MAP[iconName] || LucideIcons.Blocks;
  const isHighlighted = sequence === 3;

  return (
    <motion.div
      variants={animationVariants}
      className={cn(
        pillarVariants({ isHighlighted }),
        "hover:border-pink-500/60 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/20",
        className
      )}
    >
      {/* Glow de fondo para efecto élite */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-purple-900/40 to-pink-900/40 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" />
      
      {/* Secuencia numérica decorativa */}
      <div className="absolute top-4 right-6 font-display text-7xl font-bold text-zinc-800/80 transition-colors duration-300 group-hover:text-zinc-700/80">
        {formattedSequence}
      </div>

      <div className="relative z-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 mb-6 border border-zinc-700 transition-all duration-300 group-hover:border-pink-500/50 group-hover:bg-zinc-800">
          <Icon className="h-8 w-8 text-zinc-400 transition-colors duration-300 group-hover:text-pink-400" />
        </div>
        <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}