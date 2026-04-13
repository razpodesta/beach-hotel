/**
 * @file apps/portfolio-web/src/components/sections/portal/ArtifactShowcase.tsx
 * @description Centro de Mando de Reputación y Exhibición de Artefactos (Protocolo 33).
 *              Refactorizado: Implementación de Milestone Sentinel, sellado de tipos 
 *              para iconografía interna y optimización de atmósfera Oxygen v4.
 *              Estándar: Heimdall v2.5 Injected & React 19 Purity.
 * @version 6.0 - Milestone Sentinel & SVG Type Sealed
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useMemo, useState, useEffect, useCallback, memo } from 'react';
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
  type LucideIcon,
  type LucideProps
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (SSoT)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
import { 
  ARTIFACTS, 
  calculateProgress, 
  type House,
  type Artifact 
} from '@metashark/reputation-engine';

import { cn } from '../../../lib/utils/cn';
import { ArtifactCard } from './ArtifactCard';
import type { GamificationDictionary } from '../../../lib/schemas/gamification.schema';

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * @interface ArtifactShowcaseProps
 */
export interface ArtifactShowcaseProps {
  /** Puntos de experiencia brutos del usuario (RazTokens) */
  userXp: number;
  /** Identificadores de los artefactos en posesión */
  ownedIds: string[];
  /** Diccionario validado por contrato SSoT */
  dictionary: GamificationDictionary;
  className?: string;
}

// ============================================================================
// 1. ÁTOMO: StarIcon (Type Safe SVG)
// ============================================================================
/**
 * @description Icono de estrella tipado bajo el estándar Lucide para coherencia visual.
 */
const StarIcon = ({ className, ...props }: LucideProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="none" 
    className={cn("h-4 w-4", className)}
    {...props}
  >
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.4 8.168L12 18.896l-7.334 3.866 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
  </svg>
);

// ============================================================================
// 2. SUB-APARATO: RankHeader (Progression Intelligence)
// ============================================================================
const RankHeader = memo(({ 
  progress, 
  rankTitle, 
  artifactsCount, 
  dictionary 
}: { 
  progress: ReturnType<typeof calculateProgress>;
  rankTitle: string;
  artifactsCount: number;
  dictionary: GamificationDictionary;
}) => {
  // Milestone Sentinel: Detecta si falta menos del 15% para el siguiente nivel
  const isNearLevelUp = progress.progressPercent >= 85;

  return (
    <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-5">
           <div className={cn(
             "h-14 w-14 rounded-2xl border flex items-center justify-center transition-all duration-700 shadow-luxury",
             isNearLevelUp ? "bg-accent/10 border-accent/30 text-accent" : "bg-primary/10 border-primary/20 text-primary"
           )}>
              <Zap size={28} className={cn(isNearLevelUp ? "animate-bounce" : "animate-pulse")} />
           </div>
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.5em]">
                  Level {progress.currentLevel}
                </span>
                {isNearLevelUp && (
                  <span className="px-2 py-0.5 rounded-md bg-accent/20 text-accent text-[8px] font-bold uppercase tracking-widest animate-pulse">
                    Milestone Near
                  </span>
                )}
              </div>
              <h2 className="text-4xl font-display font-bold text-foreground tracking-tighter leading-none uppercase transition-colors">
                 {rankTitle}
              </h2>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 font-mono">
              <span className="flex items-center gap-2">
                <StarIcon className={isNearLevelUp ? "text-accent" : "text-primary"} /> 
                XP_ACCUMULATED: {progress.currentXp} RZB
              </span>
              <span>Target_Node: {progress.nextLevelXp} RZB</span>
           </div>
           <div className="h-2.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-border/50 p-0.5 relative">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progress.progressPercent}%` }} 
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "h-full relative rounded-full transition-colors duration-1000",
                  isNearLevelUp ? "bg-linear-to-r from-accent via-primary to-accent" : "bg-linear-to-r from-primary via-accent to-primary"
                )}
              >
                 <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
           </div>
        </div>
      </div>

      <div className="bg-surface/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] flex items-center justify-between shadow-3xl group/artifacts transition-all hover:border-primary/30">
         <div className="space-y-2">
            <span className="block text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
              {dictionary.artifacts_title}
            </span>
            <span className="text-3xl font-display font-bold text-foreground tracking-tighter">
              {artifactsCount}<span className="text-muted-foreground/30">/33</span>
            </span>
         </div>
         <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-foreground/30 group-hover/artifacts:text-primary group-hover/artifacts:border-primary/40 transition-all cursor-help">
            <Info size={20} className="group-hover/artifacts:scale-110 transition-transform" />
         </div>
      </div>
    </header>
  );
});
RankHeader.displayName = 'RankHeader';

// ============================================================================
// 3. SUB-APARATO: HouseNav (Silo Selection)
// ============================================================================
const HouseNav = memo(({ 
  activeHouse, 
  onHouseChange 
}: { 
  activeHouse: House | 'ALL';
  onHouseChange: (h: House | 'ALL') => void;
}) => {
  const houses: Array<{ id: House | 'ALL', icon: LucideIcon, label: string }> = [
    { id: 'ALL', icon: Trophy, label: 'GLOBAL VAULT' },
    { id: 'ARCHITECTS', icon: Shield, label: 'ARCHITECTS' },
    { id: 'WEAVERS', icon: Sparkles, label: 'WEAVERS' },
    { id: 'ANOMALIES', icon: Cpu, label: 'ANOMALIES' }
  ];

  return (
    <nav className="flex flex-wrap gap-3 bg-surface/30 p-2 rounded-3xl border border-border/50 w-max mx-auto lg:mx-0 backdrop-blur-md">
      {houses.map((house) => {
        const HouseIcon = house.icon;
        const isActive = activeHouse === house.id;
        return (
          <button
            key={house.id}
            onClick={() => onHouseChange(house.id)}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all outline-none transform-gpu",
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
  );
});
HouseNav.displayName = 'HouseNav';

// ============================================================================
// APARATO PRINCIPAL: ArtifactShowcase (The Orchestrator)
// ============================================================================
export function ArtifactShowcase({ userXp, ownedIds = [], dictionary, className }: ArtifactShowcaseProps) {
  const [activeHouse, setActiveHouse] = useState<House | 'ALL'>('ALL');
  
  /** 1. HANDSHAKE DE PROGRESIÓN (Reactor Core) */
  const progress = useMemo(() => calculateProgress(userXp), [userXp]);

  /** 2. RESOLVER DE RANGO DINÁMICO (i18n Mapping) 
   * @pilar X: Performance - Memoizado para evitar lógica condicional innecesaria.
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

  /** PROTOCOLO HEIMDALL: Telemetría de Reputación */
  useEffect(() => {
    const traceId = `p33_hub_${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${C.magenta}${C.bold}[DNA][P33]${C.reset} Artifact Registry Sync | ` +
        `Level: ${C.cyan}${progress.currentLevel}${C.reset} | Trace: ${traceId}`
      );
    }
  }, [progress.currentLevel]);

  /** 3. MOTOR DE FILTRADO TÁCTICO (Data-Driven) */
  const filteredArtifacts = useMemo(() => {
    return ARTIFACTS.filter((a: Artifact) => activeHouse === 'ALL' || a.house === activeHouse);
  }, [activeHouse]);

  const handleHouseChange = useCallback((h: House | 'ALL') => {
    setActiveHouse(h);
  }, []);

  if (!dictionary) return null;

  return (
    <div className={cn("space-y-16 animate-in fade-in duration-1000", className)}>
      
      {/* Visualización de Nivel y Rango */}
      <RankHeader 
        progress={progress} 
        rankTitle={rankTitle} 
        artifactsCount={ownedIds.length} 
        dictionary={dictionary} 
      />

      {/* Control de Navegación entre Casas */}
      <HouseNav 
        activeHouse={activeHouse} 
        onHouseChange={handleHouseChange} 
      />

      {/* Grid de Artefactos (WebGL / 3D Optimized) */}
      <motion.div 
        layout 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 min-h-[400px] transform-gpu"
      >
        <AnimatePresence mode="popLayout">
          {filteredArtifacts.map((artifact: Artifact) => {
            const isOwned = ownedIds.includes(artifact.id);
            const artifactI18n = dictionary.artifacts[artifact.id] || { 
              name: `Fragment Node ${artifact.id.substring(0, 5)}`, 
              lore: "Protocol synchronization in progress..." 
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
                  rarityLabel={dictionary.rarity_labels[rarityKey] || artifact.rarity}
                  loreLabel={dictionary.lore_label}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Footer Informativo (Editorial Guidance) */}
      <footer className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-4 group/journal cursor-pointer">
             <Hexagon size={24} className="text-primary animate-spin-slow group-hover/journal:text-accent transition-colors" strokeWidth={1.5} />
             <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed max-w-md">
                Protocolo 33 ativo. Consulte o <span className="text-foreground font-bold underline decoration-primary/30 group-hover/journal:decoration-accent transition-all">Journal Editorial</span> para localizar pistas sobre os fragmentos latentes.
             </p>
          </div>
          <button className="group/ledger flex items-center gap-5 px-10 py-5 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-primary hover:text-white shadow-3xl active:scale-95 transform-gpu">
             Ascension Rank Ledger <ChevronRight size={16} className="transition-transform group-hover/ledger:translate-x-2" />
          </button>
      </footer>
    </div>
  );
}