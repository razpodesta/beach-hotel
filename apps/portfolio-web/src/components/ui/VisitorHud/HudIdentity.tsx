/**
 * @file HudIdentity.tsx
 * @description Módulo de visualización de identidad y progreso (Protocolo 33).
 * @version 1.0 - Sovereign Reputation Standard
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Zap } from 'lucide-react';
import { calculateProgress } from '@metashark/protocol-33';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

interface HudIdentityProps {
  user: { name: string; role: string; xp: number };
  dictionary: Dictionary;
}

export function HudIdentity({ user, dictionary }: HudIdentityProps) {
  // Pilar III: Inferencia obligatoria desde el motor matemático
  const progress = useMemo(() => calculateProgress(user.xp), [user.xp]);
  const p = dictionary.profile_page;
  const t = dictionary.visitor_hud;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* HEADER DE IDENTIDAD */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-pink-500 p-px">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-950">
              <User size={28} className="text-white opacity-80" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xl border-2 border-zinc-950">
            {progress.currentLevel}
          </div>
        </div>
        <div>
          <p className="text-[9px] font-mono text-primary uppercase tracking-[0.3em] mb-1">{user.role}</p>
          <h4 className="font-display text-xl font-bold text-white tracking-tight">{user.name}</h4>
        </div>
      </div>

      {/* BARRA DE PROGRESIÓN (SSoT Sync) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-500">
          <span>{p.xp_label}: {progress.currentXp}</span>
          <span>{t.xp_next_label}: {progress.nextLevelXp}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercent}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-linear-to-r from-primary to-pink-500" 
          />
        </div>
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="rounded-2xl border border-white/5 bg-white/2 p-4 flex flex-col gap-2 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all">
          <Trophy size={16} className="text-zinc-600 group-hover:text-yellow-500" />
          <span className="text-[9px] font-bold text-zinc-600 group-hover:text-zinc-300 uppercase tracking-widest">{t.stat_artifacts}</span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/2 p-4 flex flex-col gap-2 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all">
          <Zap size={16} className="text-zinc-600 group-hover:text-primary" />
          <span className="text-[9px] font-bold text-zinc-600 group-hover:text-zinc-300 uppercase tracking-widest">{t.stat_streak}</span>
        </div>
      </div>
    </motion.div>
  );
}