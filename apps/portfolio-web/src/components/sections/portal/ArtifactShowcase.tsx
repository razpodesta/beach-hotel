/**
 * @file apps/portfolio-web/src/components/sections/portal/ArtifactShowcase.tsx
 * @description Centro de Mando de Reputación y Exhibición de Artefactos (Protocolo 33).
 *              Orquesta la visualización del progreso y la taxonomía de fragmentos.
 *              Refactorizado: Resolución de TS2741 (loreLabel sync), erradicación
 *              de hardcoding y optimización de arquitectura de componentes.
 * @version 4.1 - Contract Synchronized & Performance Optimized
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Cpu, 
  Sparkles, 
  Zap, 
  Trophy, 
  Info,
  ChevronRight,
  Hexagon,
  type LucideIcon
} from 'lucide-react';
import { 
  ARTIFACTS, 
  calculateProgress, 
  type House 
} from '@metashark/protocol-33';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Relativas - Nx Boundary Compliance)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { ArtifactCard } from './ArtifactCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface ArtifactShowcaseProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export interface ArtifactShowcaseProps {
  /** Puntos de experiencia brutos del usuario */
  userXp: number;
  /** IDs de los artefactos desbloqueados */
  ownedIds: string[];
  /** Diccionario de gamificación validado por SSoT */
  dictionary: Dictionary['gamification'];
}

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/**
 * APARATO PRINCIPAL: ArtifactShowcase
 * @description Gestiona el estado de filtrado y compone los átomos de la cuadrícula de reputación.
 */
export function ArtifactShowcase({ userXp, ownedIds, dictionary }: ArtifactShowcaseProps) {
  const [activeHouse, setActiveHouse] = useState<House | 'ALL'>('ALL');
  
  /** 1. CÁLCULO DE PROGRESO SOBERANO (Math Engine Sync) */
  const progress = useMemo(() => calculateProgress(userXp), [userXp]);

  /** 
   * 2. RESOLVER DE RANGO DINÁMICO 
   * @description Selecciona el título honorífico basado en el nivel de ascensión.
   */
  const rankTitle = useMemo(() => {
    const lvl = progress.currentLevel;
    const r = dictionary.ranks;
    if (lvl >= 33) return r.oracle;
    if (lvl >= 25) return r.sovereigns;
    if (lvl >= 15) return r.masters;
    if (lvl >= 5) return r.advanced;
    return r.initiates;
  }, [progress.currentLevel, dictionary.ranks]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Montaje
   */
  useEffect(() => {
    console.log(
      `${C.magenta}${C.bold}[DNA][P33]${C.reset} ArtifactShowcase Calibrated. ` +
      `Rank: ${C.cyan}${rankTitle}${C.reset} | Level: ${progress.currentLevel}`
    );
  }, [progress.currentLevel, rankTitle]);

  /** 3. MOTOR DE FILTRADO TÁCTICO (O(n) Performance) */
  const filteredArtifacts = useMemo(() => {
    return ARTIFACTS.filter(a => activeHouse === 'ALL' || a.house === activeHouse);
  }, [activeHouse]);

  /** 4. MATRIZ DE CASAS (SSoT Navigation) */
  const houses: Array<{ id: House | 'ALL', icon: LucideIcon, label: string }> = useMemo(() => [
    { id: 'ALL', icon: Trophy, label: 'GLOBAL VAULT' },
    { id: 'ARCHITECTS', icon: Shield, label: 'ARCHITECTS' },
    { id: 'WEAVERS', icon: Sparkles, label: 'WEAVERS' },
    { id: 'ANOMALIES', icon: Cpu, label: 'ANOMALIES' }
  ], []);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      
      {/* --- 1. HEADER DE STATUS (The Ascension Hub) --- */}
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-5">
             <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-luxury">
                <Zap size={28} className="animate-pulse" />
             </div>
             <div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.5em] block mb-1">
                  Level {progress.currentLevel}
                </span>
                <h2 className="text-4xl font-display font-bold text-foreground tracking-tighter leading-none">
                   {rankTitle}
                </h2>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <span className="flex items-center gap-2">
                  <StarIcon className="text-primary h-3 w-3" /> 
                  XP: {progress.currentXp} RZB
                </span>
                <span>Next Rank: {progress.nextLevelXp} RZB</span>
             </div>
             <div className="h-2.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-border/50 p-0.5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress.progressPercent}%` }} 
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-linear-to-r from-primary via-accent to-primary relative rounded-full shadow-[0_0_20px_var(--color-primary)]"
                >
                   <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
             </div>
          </div>
        </div>

        <div className="bg-surface/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] flex items-center justify-between shadow-3xl">
           <div className="space-y-2">
              <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                {dictionary.artifacts_title}
              </span>
              <span className="text-3xl font-display font-bold text-foreground tracking-tighter">
                {ownedIds.length}<span className="text-muted-foreground/50">/33</span>
              </span>
           </div>
           <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-foreground/50 hover:text-primary transition-colors cursor-help group">
              <Info size={20} className="group-hover:scale-110 transition-transform" />
           </div>
        </div>
      </header>

      {/* --- 2. FILTRAGEM POR LINAGEM (Tactic Navigation) --- */}
      <nav className="flex flex-wrap gap-3 bg-surface/30 p-2 rounded-3xl border border-border/50 w-max mx-auto lg:mx-0 backdrop-blur-md">
        {houses.map((house) => {
          const HouseIcon = house.icon;
          const isActive = activeHouse === house.id;
          return (
            <button
              key={house.id}
              onClick={() => setActiveHouse(house.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all outline-none",
                isActive 
                  ? "bg-foreground text-background shadow-2xl scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
              )}
            >
              <HouseIcon size={14} strokeWidth={isActive ? 2.5 : 1.5} />
              {house.label}
            </button>
          );
        })}
      </nav>

      {/* --- 3. GRID DE ATOMOS (The 33 Chamber) --- */}
      <motion.div 
        layout 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 min-h-[400px] transform-gpu"
      >
        <AnimatePresence mode="popLayout">
          {filteredArtifacts.map((artifact) => {
            const isOwned = ownedIds.includes(artifact.id);
            const artifactI18n = dictionary.artifacts[artifact.id] || { 
              name: `Fragmento ${artifact.id.substring(0, 5)}`, 
              lore: "Fragment data synchronizing..." 
            };
            const rarityKey = artifact.rarity.toLowerCase() as keyof typeof dictionary.rarity_labels;
            
            return (
              <motion.div
                key={artifact.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <ArtifactCard
                  isOwned={isOwned}
                  labels={artifactI18n}
                  rarityLabel={dictionary.rarity_labels[rarityKey]}
                  loreLabel={dictionary.lore_label}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* --- 4. FOOTER: CONVITE AO PROTOCOLO --- */}
      <footer className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 transition-opacity duration-700">
          <div className="flex items-center gap-4">
             <Hexagon size={24} className="text-primary animate-spin-slow" strokeWidth={1.5} />
             <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
                Consult the <span className="text-foreground font-bold underline decoration-primary/30">Concierge Journal</span> to locate clues about latent fragments.
             </p>
          </div>
          <button className="group flex items-center gap-5 px-10 py-5 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-primary hover:text-white shadow-3xl active:scale-95">
             Global Ascension Rank <ChevronRight size={16} className="transition-transform group-hover:translate-x-2" />
          </button>
      </footer>
    </div>
  );
}

/** Átomos Locales para higiene visual */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.4 8.168L12 18.896l-7.334 3.866 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
    </svg>
  );
}