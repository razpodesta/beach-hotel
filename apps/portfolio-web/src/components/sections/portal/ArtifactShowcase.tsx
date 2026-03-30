/**
 * @file ArtifactShowcase.tsx
 * @description Centro de Mando de Reputación y Exhibición de Artefactos (Protocolo 33).
 *              Orquesta la visualização del progresso, segmentación por casas y grid dinámico.
 *              Refactorizado: Atomização completa, purga de 'any' y resolución de tipos.
 * @version 2.0 - Atomized & High Performance
 * @author Raz Podestá - MetaShark Tech
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
 * IMPORTACIONES DE INFRAESTRUCTRURA Y ATOMOS
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import { ArtifactCard } from './ArtifactCard';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface ArtifactShowcaseProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export interface ArtifactShowcaseProps {
  userXp: number;
  ownedIds: string[];
  dictionary: Dictionary['gamification'];
}

/**
 * APARATO PRINCIPAL: ArtifactShowcase
 * @description Gestiona el estado de filtrado y compone los átomos de la cuadrícula.
 */
export function ArtifactShowcase({ userXp, ownedIds, dictionary }: ArtifactShowcaseProps) {
  const [activeHouse, setActiveHouse] = useState<House | 'ALL'>('ALL');
  
  const progress = useMemo(() => calculateProgress(userXp), [userXp]);

  useEffect(() => {
    console.log(`[HEIMDALL][P33] ArtifactShowcase synchronized. XP: ${userXp}`);
  }, [userXp]);

  const filteredArtifacts = useMemo(() => {
    return ARTIFACTS.filter(a => activeHouse === 'ALL' || a.house === activeHouse);
  }, [activeHouse]);

  /** 
   * MATRIZ DE CASAS (SSoT UI) 
   * @pilar III: Tipado estricto LucideIcon (Cero any).
   */
  const houses: Array<{ id: House | 'ALL', icon: LucideIcon, label: string }> = useMemo(() => [
    { id: 'ALL', icon: Trophy, label: 'COLEÇÃO COMPLETA' },
    { id: 'ARCHITECTS', icon: Shield, label: 'CASA DOS ARQUITETOS' },
    { id: 'WEAVERS', icon: Sparkles, label: 'CASA DAS TEJEDORAS' },
    { id: 'ANOMALIES', icon: Cpu, label: 'CASA DOS ANOMALIA' }
  ], []);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      
      {/* --- 1. HEADER DE STATUS --- */}
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Zap size={24} className="animate-pulse" />
             </div>
             <div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.5em]">Nível de Ascensão</span>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tighter">
                   {progress.currentLevel} • <span className="text-primary">Soberano</span>
                </h2>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Experiência Total: {progress.currentXp} RZB</span>
                <span>Próximo Nível: {progress.nextLevelXp} RZB</span>
             </div>
             <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress.progressPercent}%` }} 
                  transition={{ duration: 2, ease: "circOut" }}
                  /** @fix: Sugerencia de clase canónica Tailwind */
                  className="h-full bg-linear-to-r from-primary via-accent to-primary relative shadow-[0_0_15px_oklch(65%_0.25_270/0.3)]"
                />
             </div>
          </div>
        </div>

        <div className="bg-surface/60 border border-border p-6 rounded-4xl flex items-center justify-between shadow-2xl">
           <div className="space-y-1">
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Artefatos Coletados</span>
              <span className="text-2xl font-display font-bold text-foreground">{ownedIds.length}<span className="text-zinc-700">/33</span></span>
           </div>
           <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-zinc-800">
              <Info size={20} />
           </div>
        </div>
      </header>

      {/* --- 2. FILTRAGEM --- */}
      <nav className="flex flex-wrap gap-3 bg-surface/30 p-2 rounded-3xl border border-border/50 w-max mx-auto lg:mx-0">
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
                  ? "bg-foreground text-background shadow-xl scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              <HouseIcon size={14} strokeWidth={isActive ? 2.5 : 1.5} />
              {house.label}
            </button>
          );
        })}
      </nav>

      {/* --- 3. GRID DE ATOMOS --- */}
      <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredArtifacts.map((artifact) => {
            const isOwned = ownedIds.includes(artifact.id);
            const artifactI18n = dictionary.artifacts[artifact.id] || { name: artifact.id, lore: "???" };
            const rarityKey = artifact.rarity.toLowerCase() as keyof typeof dictionary.rarity_labels;
            
            return (
              <ArtifactCard
                key={artifact.id}
                isOwned={isOwned}
                labels={artifactI18n}
                rarityLabel={dictionary.rarity_labels[rarityKey]}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* --- 4. FOOTER --- */}
      <footer className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
             <Hexagon size={20} className="text-primary animate-spin-slow" />
             <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Acesse o <span className="text-foreground font-bold">Concierge Journal</span> para pistas sobre fragmentos.
             </p>
          </div>
          <button className="group flex items-center gap-4 px-10 py-5 rounded-full bg-white text-black font-bold text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-primary hover:text-white shadow-3xl active:scale-95">
             Ver Rank Global <ChevronRight size={16} className="transition-transform group-hover:translate-x-2" />
          </button>
      </footer>
    </div>
  );
}