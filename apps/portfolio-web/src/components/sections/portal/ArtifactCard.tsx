/**
 * @file apps/portfolio-web/src/components/sections/portal/ArtifactCard.tsx
 * @description Unidad atómica de exhibición de fragmentos (Protocolo 33).
 *              Refactorizado: Resolución de TS2304 (AnimatePresence import), 
 *              normalización de clases Tailwind v4 y optimización de 
 *              renderizado bajo el estándar Day-First.
 * @version 2.1 - Framework Sync & Tailwind Canonical
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Hexagon, Sparkles } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';

/**
 * @interface ArtifactCardProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface ArtifactCardProps {
  /** Indica si el usuario posee el artefacto en su bóveda */
  isOwned: boolean;
  /** Datos del artefacto (Nombre y Lore) provenientes del diccionario */
  labels: { name: string; lore: string };
  /** Etiqueta de rareza (Común, Raro, Legendario, etc.) */
  rarityLabel: string;
  /** Texto del encabezado del overlay (ej: "Lore del Fragmento") */
  loreLabel: string;
  className?: string;
}

/**
 * APARATO: ArtifactCard
 * @description Renderiza un artefacto con profundidad física y estados dinámicos.
 * @pilar X: Envuelto en memo para maximizar la performance en grids densos.
 */
export const ArtifactCard = memo(({ 
  isOwned, 
  labels, 
  rarityLabel,
  loreLabel,
  className 
}: ArtifactCardProps) => {
  return (
    <motion.div
      whileHover={isOwned ? { y: -8, scale: 1.02 } : {}}
      whileTap={isOwned ? { scale: 0.98 } : {}}
      className={cn(
        "group relative aspect-square rounded-[2.5rem] border transition-all duration-1000 overflow-hidden transform-gpu",
        isOwned 
          ? "bg-surface/40 border-border hover:border-primary/40 shadow-xl" 
          : "bg-foreground/2 border-border/30 grayscale opacity-40 cursor-not-allowed",
        className
      )}
      role="article"
      aria-label={`${labels.name} - ${rarityLabel}`}
    >
      {/* 1. CAPA DE ATMÓSFERA (Glow Adaptativo) */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none",
        isOwned ? "bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] opacity-[0.03]" : ""
      )} />

      {/* 2. CONTENIDO VISUAL (DNA Central) */}
      <div className="relative h-full w-full flex flex-col items-center justify-center p-8 text-center z-10">
        {isOwned ? (
          <>
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
              <Hexagon 
                size={48} 
                className="text-primary relative transform-gpu group-hover:rotate-12 transition-transform duration-1000" 
                strokeWidth={1.2} 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[10px] font-mono font-bold text-primary">33</span>
              </div>
            </div>
            
            <h4 className="font-display text-sm font-bold text-foreground uppercase tracking-tight mb-2 line-clamp-1">
              {labels.name}
            </h4>
            
            <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-[0.3em]">
              {rarityLabel}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <div className="p-4 rounded-2xl bg-foreground/3 border border-border/50">
               <Lock size={28} className="text-muted-foreground/30" strokeWidth={1.5} />
             </div>
             <div className="space-y-1">
               <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest block">
                 Locked Node
               </span>
               <div className="flex items-center justify-center gap-1.5 opacity-20">
                 <div className="h-1 w-1 rounded-full bg-foreground" />
                 <div className="h-1 w-1 rounded-full bg-foreground" />
                 <div className="h-1 w-1 rounded-full bg-foreground" />
               </div>
             </div>
          </div>
        )}
      </div>

      {/* 3. OVERLAY DE LORE (Sovereign Reveal) */}
      <AnimatePresence>
        {isOwned && (
          <div className="absolute inset-0 bg-surface/95 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center p-10 translate-y-6 group-hover:translate-y-0 z-20">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles size={12} className="text-primary animate-pulse" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">
                  {loreLabel}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic font-light font-sans">
                 "{labels.lore}"
              </p>
              
              {/* Decorativo de base del overlay */}
              <div className="absolute bottom-8 left-10 right-10 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
          </div>
        )}
      </AnimatePresence>

      {/* Artefacto de Luxury: Borde sutil de luz en hover */}
      {isOwned && (
        <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 rounded-[2.5rem] transition-colors duration-1000 pointer-events-none" />
      )}
    </motion.div>
  );
});

ArtifactCard.displayName = 'ArtifactCard';