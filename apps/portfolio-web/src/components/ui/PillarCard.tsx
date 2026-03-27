/**
 * @file PillarCard.tsx
 * @description Aparato visual para la exhibición de pilares estratégicos y valores.
 *              Refactorizado: Higiene absoluta de imports, clases canónicas de Tailwind
 *              y cumplimiento estricto del protocolo de diseño MetaShark.
 * @version 6.1 - Canonical Hygiene & Pilar X Compliance
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { 
  BookOpen, BrainCircuit, Goal, MapPin, 
  Users, Sparkles, Blocks, type LucideIcon 
} from 'lucide-react';

import { cn } from '../../lib/utils/cn';

/**
 * MAPA MAESTRO DE ICONOGRAFÍA (SSoT)
 * @description Sincronizado con AmenityIconKey y MissionVisionSchema.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  'brain-circuit': BrainCircuit,
  'goal': Goal,
  'pin': MapPin,
  'users': Users,
  'sparkles': Sparkles,
  'blocks': Blocks,
};

/**
 * VARIANTES DE DISEÑO (Pilar VII)
 * @description Utiliza tokens semánticos del sistema de diseño MetaShark.
 */
const pillarVariants = cva(
  "relative flex h-full flex-col p-8 md:p-10 overflow-hidden rounded-[2.5rem] border transition-all duration-700 group",
  {
    variants: {
      isHighlighted: {
        true: "bg-primary/5 border-primary/20 shadow-3xl shadow-primary/10",
        false: "bg-zinc-900/40 border-white/5",
      }
    },
    defaultVariants: {
      isHighlighted: false,
    }
  }
);

/**
 * COREOGRAFÍA MEA/UX (Pilar XII)
 */
const animationVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export interface PillarCardProps extends VariantProps<typeof pillarVariants> {
  /** Identificador del icono según el mapa soberano */
  iconName: string;
  /** Título del pilar (i18n) */
  title: string;
  /** Descripción detallada (i18n) */
  description: string;
  /** Número de orden para el decorativo visual */
  sequence: number;
  /** Forzar estado de resaltado desde el orquestador de datos */
  isHighlighted?: boolean;
  className?: string;
}

/**
 * APARATO: PillarCard
 * @description Renderiza una cápsula de valor con profundidad visual y telemetría táctica.
 */
export function PillarCard({ 
  iconName, 
  title, 
  description, 
  sequence, 
  isHighlighted = false,
  className 
}: PillarCardProps) {
  
  /**
   * RESOLUCIÓN DE SECUENCIA (Pilar XII)
   * Garantiza el padding de ceros para una estética editorial consistente.
   */
  const formattedSequence = useMemo(() => 
    sequence.toString().padStart(2, '0'), 
  [sequence]);

  // Selección de icono con fallback seguro (Pilar VIII)
  const Icon = ICON_MAP[iconName] || Blocks;

  return (
    <motion.article
      variants={animationVariants}
      className={cn(
        pillarVariants({ isHighlighted }),
        "hover:border-primary/40 hover:-translate-y-2 transform-gpu",
        className
      )}
    >
      {/* 1. CAPA DE PROFUNDIDAD (Luxury Glow) */}
      <div className={cn(
        "absolute inset-0 -z-10 bg-linear-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-1000",
        "group-hover:opacity-100"
      )} />
      
      {/* 2. DECORATIVO NUMÉRICO (Watermark) 
          @fix: text-white/3 (Canonical Tailwind v4 Class)
      */}
      <div className="absolute -top-2 -right-2 font-display text-8xl md:text-9xl font-bold text-white/3 transition-colors duration-700 group-hover:text-primary/10 select-none pointer-events-none">
        {formattedSequence}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* CONTENEDOR DE ICONO */}
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl mb-8 border transition-all duration-700",
          isHighlighted 
            ? "bg-primary/10 border-primary/30 text-primary" 
            : "bg-white/5 border-white/10 text-zinc-500 group-hover:border-primary/50 group-hover:text-primary"
        )}>
          <Icon size={32} strokeWidth={1.2} className="group-hover:rotate-12 transition-transform duration-700" />
        </div>

        {/* NARRATIVA */}
        <header className="mb-4">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tighter leading-none">
            {title}
          </h3>
        </header>
        
        <p className="font-sans text-sm md:text-base text-zinc-400 leading-relaxed font-light italic group-hover:text-zinc-300 transition-colors">
          {description}
        </p>

        {/* INDICADOR DE PASO (Progress Indicator Decor) */}
        <div className="mt-auto pt-8 flex items-center gap-2">
           <div className={cn(
             "h-1 w-12 rounded-full transition-all duration-1000",
             isHighlighted ? "bg-primary" : "bg-white/10 group-hover:bg-primary/40 group-hover:w-16"
           )} />
        </div>
      </div>
    </motion.article>
  );
}