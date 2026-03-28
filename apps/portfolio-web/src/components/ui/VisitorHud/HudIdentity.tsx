/**
 * @file HudIdentity.tsx
 * @description Módulo de visualización de identidad y progreso (Protocolo 33).
 *              Refactorizado: Sincronización atmosférica Day/Night, inyección de 
 *              clases canónicas Tailwind v4 y trazabilidad forense.
 * @version 2.0 - Sovereign Reputation & Atmosphere Aware
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Zap, Star } from 'lucide-react';
import { calculateProgress } from '@metashark/protocol-33';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

/**
 * @interface HudIdentityProps
 */
interface HudIdentityProps {
  /** Usuario con data de reputación inyectada */
  user: { name: string; role: string; xp: number };
  /** Diccionario maestro nivelado */
  dictionary: Dictionary;
}

/**
 * APARATO: HudIdentity
 * @description Renderiza el perfil del huésped y su estatus dentro del Protocolo 33.
 */
export function HudIdentity({ user, dictionary }: HudIdentityProps) {
  // Pilar III: Inferencia desde el motor lógico central
  const progress = useMemo(() => calculateProgress(user.xp), [user.xp]);
  
  const p = dictionary.profile_page;
  const t = dictionary.visitor_hud;

  /**
   * PROTOCOLO HEIMDALL: Trazabilidad de Reputación
   * @pilar IV: Registra el rango detectado para auditoría de experiencia.
   */
  useEffect(() => {
    console.log(
      `[HEIMDALL][P33] Identity Synced: ${user.name} | Level: ${progress.currentLevel} | XP: ${user.xp}`
    );
  }, [user.name, user.xp, progress.currentLevel]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 transform-gpu"
    >
      {/* 1. HEADER DE IDENTIDAD: El Huésped Soberano */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {/* Avatar Container con Acento de Marca */}
          <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-primary to-accent p-px shadow-2xl">
            <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-surface transition-colors duration-700">
              <User size={28} className="text-foreground opacity-80" />
            </div>
          </div>
          
          {/* Badge de Nivel con Protector de Borde Atmosférico */}
          <div className={cn(
            "absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full font-display text-[10px] font-bold text-white shadow-xl border-2 transition-colors duration-700",
            "bg-primary border-surface"
          )}>
            {progress.currentLevel}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-mono text-primary uppercase tracking-[0.4em] font-bold mb-1">
            {user.role}
          </p>
          <h4 className="font-display text-xl font-bold text-foreground tracking-tight leading-none">
            {user.name}
          </h4>
        </div>
      </div>

      {/* 2. BARRA DE PROGRESIÓN: Sincronía RZB (Pilar XII) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Star size={10} className="text-primary" /> {p.xp_label}: {progress.currentXp}
          </span>
          <span>{t.xp_next_label}: {progress.nextLevelXp}</span>
        </div>
        
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/5 transition-colors">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercent}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-linear-to-r from-primary to-accent relative" 
          >
            {/* Efecto de brillo de energía (RZB) */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </motion.div>
        </div>
      </div>

      {/* 3. ESTADÍSTICAS RÁPIDAS: Artefactos y Secuencia */}
      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "rounded-4xl border border-border/40 bg-surface p-5 flex flex-col gap-3 transition-all duration-700",
          "opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 hover:border-primary/30"
        )}>
          <Trophy size={18} className="text-muted-foreground transition-colors group-hover:text-yellow-500" />
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">
            {t.stat_artifacts}
          </span>
        </div>

        <div className={cn(
          "rounded-4xl border border-border/40 bg-surface p-5 flex flex-col gap-3 transition-all duration-700",
          "opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 hover:border-accent/30"
        )}>
          <Zap size={18} className="text-muted-foreground transition-colors group-hover:text-accent" />
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">
            {t.stat_streak}
          </span>
        </div>
      </div>
    </motion.div>
  );
}