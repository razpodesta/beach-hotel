/**
 * @file HudIdentity.tsx
 * @description Módulo de identidad y reputación del Huésped Soberano (Protocolo 33).
 *              Refactorizado: Integración con el Reactor de Reputación v14.1, 
 *              resolución dinámica de etiquetas de rango (RBAC i18n) y 
 *              optimización de animaciones de bario-frecuencia.
 *              Estándar: React 19 Pure & Tailwind v4 OKLCH.
 * @version 3.0 - Reactive Reputation & Localized Ranks
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useMemo, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Zap, Star, ShieldCheck } from 'lucide-react';
import { calculateProgress } from '@metashark/protocol-33';

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
  /** Datos de sesión del usuario autenticado */
  user: { 
    name: string; 
    role: SovereignRoleType; 
    xp: number 
  };
  /** Diccionario maestro para etiquetas de rango y perfil */
  dictionary: Dictionary;
}

/**
 * APARATO: HudIdentity
 * @description Representa la ascensión del usuario en el ecosistema MetaShark.
 */
export const HudIdentity = memo(({ user, dictionary }: HudIdentityProps) => {
  /**
   * 1. MOTOR DE PROGRESIÓN (Math Engine Sync)
   * @pilar X: Performance - El cálculo se realiza solo si el XP muta.
   */
  const progress = useMemo(() => calculateProgress(user.xp), [user.xp]);
  
  const p = dictionary.profile_page;
  const t = dictionary.visitor_hud;
  const portal = dictionary.portal;

  /**
   * 2. RESOLVER DE RANGO (Localized Identity)
   * @description Mapea el rol técnico a una etiqueta narrativa de hospitalidad.
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
   * @pilar IV: Trazabilidad de la sincronización de identidad en el HUD.
   */
  useEffect(() => {
    const traceId = `p33_sync_${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `%c[DNA][P33] Identity Rendered | Trace: ${traceId} | Level: ${progress.currentLevel}`, 
        'color: #a855f7'
      );
    }
  }, [progress.currentLevel]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 transform-gpu"
    >
      {/* --- 1. SECCIÓN: AVATAR & RANGO (Atmosphere Guard) --- */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {/* Contenedor de Avatar con Acento OKLCH */}
          <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-primary to-accent p-px shadow-luxury transform-gpu transition-transform hover:scale-105 duration-500">
            <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-surface transition-colors duration-1000">
              <User size={28} className="text-foreground opacity-60" />
            </div>
          </div>
          
          {/* Badge de Nivel con Glow de Progresión */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            key={progress.currentLevel}
            className={cn(
              "absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full font-display text-[10px] font-bold text-white shadow-3xl border-2 transition-all duration-700",
              "bg-primary border-surface"
            )}
          >
            {progress.currentLevel}
          </motion.div>
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-mono text-primary uppercase tracking-[0.4em] font-bold mb-1 truncate">
            {localizedRole}
          </p>
          <h4 className="font-display text-xl font-bold text-foreground tracking-tight leading-none truncate">
            {user.name}
          </h4>
        </div>
      </div>

      {/* --- 2. BARRA DE PROGRESIÓN (Reputation Reactor) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5 transition-colors hover:text-primary">
            <Star size={10} className="text-primary animate-pulse" /> 
            {p.xp_label}: <b className="text-foreground">{progress.currentXp}</b> RZB
          </span>
          <span className="opacity-60">{t.xp_next_label}: {progress.nextLevelXp} RZB</span>
        </div>
        
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/5 border border-border/10 p-0.5">
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

      {/* --- 3. ESTADÍSTICAS OPERATIVAS (Lego Atoms) --- */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card: Artefactos */}
        <div className={cn(
          "group rounded-4xl border border-border/40 bg-surface/50 p-5 flex flex-col gap-3 transition-all duration-700",
          "hover:border-primary/30 hover:bg-surface hover:-translate-y-1 transform-gpu"
        )}>
          <div className="flex items-center justify-between">
            <Trophy size={18} className="text-muted-foreground transition-colors group-hover:text-yellow-500 group-hover:rotate-12" />
            <ShieldCheck size={12} className="text-success opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">
            {t.stat_artifacts}
          </span>
        </div>

        {/* Card: Racha / Engagement */}
        <div className={cn(
          "group rounded-4xl border border-border/40 bg-surface/50 p-5 flex flex-col gap-3 transition-all duration-700",
          "hover:border-accent/30 hover:bg-surface hover:-translate-y-1 transform-gpu"
        )}>
          <div className="flex items-center justify-between">
            <Zap size={18} className="text-muted-foreground transition-colors group-hover:text-accent animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-success shadow-success/40 shadow-lg" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">
            {t.stat_streak}
          </span>
        </div>
      </div>

      {/* FOOTER: INDICADOR DE PROTOCOLO */}
      <div className="pt-2 text-center opacity-20 group-hover:opacity-40 transition-opacity">
         <p className="text-[7px] font-mono uppercase tracking-[0.6em] text-foreground">
           P33_CORE_LINK: STABLE
         </p>
      </div>
    </motion.div>
  );
});

HudIdentity.displayName = 'HudIdentity';