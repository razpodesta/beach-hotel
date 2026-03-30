/**
 * @file ArtifactCard.tsx
 * @description Unidad atómica de exhibición de fragmentos (Protocolo 33).
 *              Implementa Pilar XII (MEA/UX) mediante inercia física y resplandores.
 * @version 1.2 - Canonical Tailwind & Pure Logic
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Hexagon } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';

/**
 * @interface ArtifactCardProps
 */
interface ArtifactCardProps {
  isOwned: boolean;
  labels: { name: string; lore: string };
  rarityLabel: string;
}

/**
 * APARATO: ArtifactCard
 * @description Renderiza un artefacto individual con estados de bloqueo/posesión.
 */
export const ArtifactCard = ({ 
  isOwned, 
  labels, 
  rarityLabel 
}: ArtifactCardProps) => {
  return (
    <motion.div
      whileHover={isOwned ? { y: -8, scale: 1.02 } : {}}
      className={cn(
        "group relative aspect-square rounded-[2.5rem] border transition-all duration-700 overflow-hidden transform-gpu",
        isOwned 
          ? "bg-surface/40 border-border hover:border-primary/40 shadow-xl" 
          : "bg-background/20 border-white/5 grayscale opacity-40 cursor-not-allowed"
      )}
    >
      {/* 1. CAPA DE ATMÓSFERA (Glow) */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none",
        isOwned ? "bg-primary/5" : ""
      )} />

      {/* 2. CONTENIDO VISUAL */}
      <div className="relative h-full w-full flex flex-col items-center justify-center p-8 text-center">
        {isOwned ? (
          <>
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
              <Hexagon size={48} className="text-primary relative transform-gpu group-hover:rotate-12 transition-transform duration-700" strokeWidth={1.2} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[10px] font-mono font-bold text-primary">33</span>
              </div>
            </div>
            
            <h4 className="font-display text-sm font-bold text-foreground uppercase tracking-tight mb-2">
              {labels.name}
            </h4>
            
            <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-[0.3em]">
              {rarityLabel}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <Lock size={32} className="text-zinc-800" strokeWidth={1.5} />
             <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">Fragmento Latente</span>
          </div>
        )}
      </div>

      {/* 3. OVERLAY DE LORE (Revealing on Hover) */}
      {isOwned && (
        <div className="absolute inset-0 bg-surface/90 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center p-8 translate-y-4 group-hover:translate-y-0">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-4">Lore do Fragmento</p>
            <p className="text-xs text-muted-foreground leading-relaxed italic font-light">
               "{labels.lore}"
            </p>
        </div>
      )}
    </motion.div>
  );
};