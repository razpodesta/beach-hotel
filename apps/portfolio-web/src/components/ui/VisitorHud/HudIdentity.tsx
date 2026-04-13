/**
 * @file apps/portfolio-web/src/components/ui/VisitorHud/HudIdentity.tsx
 * @description Módulo de identidad y reputación del Huésped Soberano (Protocolo 33).
 *              Refactorizado: Sincronización con el Pasaporte v3.1, inyección de 
 *              conteo real de artefactos y optimización de atmósfera Oxygen v4.
 *              Estándar: Heimdall v2.5 Forensic Logging & React 19 Pure.
 * @version 3.1 - Passport Sync & Oxygen v4 Hardened
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Star, TrendingUp } from 'lucide-react';
import { calculateProgress } from '@metashark/reputation-engine';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';
import type { SovereignRoleType } from '@metashark/cms-core';

/**
 * @interface HudIdentityProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface HudIdentityProps {
  /** Datos de identidad sincronizados desde el Bridge v3.1 */
  user: { 
    name: string; 
    role: SovereignRoleType; 
    xp: number;
    artifactsCount?: number;
  };
  /** Diccionario maestro nivelado */
  dictionary: Dictionary;
}

// Protocolo Cromático Heimdall v2.5
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', bold: '\x1b[1m'
};

/**
 * APARATO: HudIdentity
 * @description Representa la jerarquía y el progreso digital del Huésped.
 */
export const HudIdentity = memo(({ user, dictionary }: HudIdentityProps) => {
  /**
   * 1. MOTOR DE PROGRESIÓN (P33 Engine Core)
   * @pilar X: Performance - Cálculo determinista basado en RazTokens.
   */
  const progress = useMemo(() => calculateProgress(user.xp), [user.xp]);
  
  const p = dictionary.profile_page;
  const t = dictionary.visitor_hud;
  const portal = dictionary.portal;

  /**
   * 2. RESOLVER DE RANGO (Localized RBAC Labels)
   */
  const localizedRole = useMemo(() => {
    const roleMap: Record<SovereignRoleType, string> = {
      developer: portal.welcome_developer,
      admin: portal.welcome_admin,
      operator: portal.welcome_operator,
      sponsor: portal.welcome_guest,
      guest: portal.welcome_guest
    };
    return roleMap[user.role] || user.role;
  }, [user.role, portal]);

  /**
   * PROTOCOLO HEIMDALL: Telemetría de Reputación
   */
  useEffect(() => {
    const traceId = `p33_pulse_${Date.now().toString(36).toUpperCase()}`;
    const xpRemaining = progress.nextLevelXp - progress.currentXp;
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `${C.magenta}${C.bold}[DNA][P33]${C.reset} Identity Synchronized | ` +
        `Level: ${C.cyan}${progress.currentLevel}${C.reset} | ` +
        `Next: ${C.yellow}${xpRemaining} RZB${C.reset} | ` +
        `Trace: ${traceId}`
      );
    }
  }, [progress.currentLevel, progress.nextLevelXp, progress.currentXp]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 transform-gpu"
    >
      {/* --- 1. SECCIÓN: IDENTIDAD VISUAL (Oxygen Avatar) --- */}
      <div className="flex items-center gap-5">
        <div className="relative group">
          {/* Contenedor de Avatar con Acento OKLCH v4 */}
          <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-primary to-accent p-px shadow-luxury transform-gpu transition-all duration-700 hover:rotate-3">
            <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-surface transition-colors duration-1000">
              <User size={28} className="text-foreground/40 group-hover:text-primary transition-colors" />
            </div>
          </div>
          
          {/* Badge de Nivel con Glow de Progresión */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            key={progress.currentLevel}
            className={cn(
              "absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full font-display text-[10px] font-bold text-white shadow-3xl border-2 transition-all duration-700",
              "bg-primary border-surface shadow-[0_0_15px_oklch(65%_0.25_270/0.4)]"
            )}
          >
            {progress.currentLevel}
          </motion.div>
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-mono text-primary uppercase tracking-[0.4em] font-bold mb-1 truncate">
            {localizedRole}
          </p>
          <h4 className="font-display text-xl font-bold text-foreground tracking-tight leading-none truncate transition-colors">
            {user.name}
          </h4>
        </div>
      </div>

      {/* --- 2. BARRA DE PROGRESIÓN (A11Y Compliant) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5 transition-colors hover:text-primary cursor-help" title={`Total XP: ${progress.currentXp} RazTokens`}>
            <Star size={10} className="text-primary animate-pulse" /> 
            {p.xp_label}: <b className="text-foreground">{progress.currentXp}</b> RZB
          </span>
          <span className="opacity-60">{t.xp_next_label}: {progress.nextLevelXp} RZB</span>
        </div>
        
        <div 
          className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/5 border border-border/10 p-0.5"
          role="progressbar"
          aria-valuenow={progress.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercent}%` }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-linear-to-r from-primary via-accent to-primary relative rounded-full" 
          >
            {/* Efecto Shimmer de energía RazToken */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>
      </div>

      {/* --- 3. ESTADÍSTICAS SOBERANAS (Lego Dashboard) --- */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card: Artefactos (Data-Driven Count) */}
        <div className={cn(
          "group rounded-4xl border border-border/40 bg-surface/50 p-5 flex flex-col gap-3 transition-all duration-700",
          "hover:border-primary/30 hover:bg-surface hover:-translate-y-1 transform-gpu shadow-sm hover:shadow-xl"
        )}>
          <div className="flex items-center justify-between">
            <Trophy size={18} className="text-muted-foreground transition-all duration-500 group-hover:text-yellow-500 group-hover:scale-110 group-hover:rotate-12" />
            <span className="font-display font-bold text-foreground leading-none">
              {user.artifactsCount ?? 0}
            </span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">
            {t.stat_artifacts}
          </span>
        </div>

        {/* Card: Progresión de Rango */}
        <div className={cn(
          "group rounded-4xl border border-border/40 bg-surface/50 p-5 flex flex-col gap-3 transition-all duration-700",
          "hover:border-accent/30 hover:bg-surface hover:-translate-y-1 transform-gpu shadow-sm hover:shadow-xl"
        )}>
          <div className="flex items-center justify-between">
            <TrendingUp size={18} className="text-muted-foreground transition-all duration-500 group-hover:text-accent group-hover:scale-110" />
            <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_oklch(70%_0.18_140)] animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">
            {t.stat_streak}
          </span>
        </div>
      </div>

      {/* FOOTER: INDICADOR DE HANDSHAKE */}
      <div className="pt-2 text-center">
         <p className="text-[7px] font-mono uppercase tracking-[0.6em] text-foreground/20 group-hover:text-primary/40 transition-colors duration-1000">
           P33_DNA_LINK: NOMINAL
         </p>
      </div>
    </motion.div>
  );
});

HudIdentity.displayName = 'HudIdentity';