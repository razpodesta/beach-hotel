/**
 * @file VisitorHud.tsx
 * @description Centro de Mando Perimetral (Heimdall HUD). 
 *              Orquesta la telemetría ambiental, la geolocalización y el motor 
 *              de reputación Protocolo 33 en tiempo real.
 *              Refactorizado: 100% Data-Driven, Zero Hardcoding, Linter Compliant.
 * @version 22.1 - Elite Compliance Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { 
  Loader2, X, ScanFace, MapPin, Clock, CloudSun, 
  Activity, Shield, Trophy, Zap, ChevronRight, User, LogIn
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import { useVisitorData } from '../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../lib/store/ui.store';
import { calculateProgress, type UserProgress } from '@metashark/protocol-33';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * CONSTANTES TÉCNICAS
 */
const HUD_TABS = ['identity', 'telemetry'] as const;
type HudTab = (typeof HUD_TABS)[number];

interface SovereignUserSession {
  name: string;
  role: string;
  xp: number;
  level: number;
}

/**
 * Hook de Hidratación de Élite: Erradica el Hydration Mismatch.
 * @description Utiliza useSyncExternalStore para una detección de entorno libre de parpadeos.
 * @returns {boolean} True si el componente está montado en el cliente.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    /**
     * FUNCIÓN DE LIMPIEZA SOBERANA
     * @description Satisfaciendo @typescript-eslint/no-empty-function.
     * Al ser un estado de montaje terminal en cliente, no requiere des-suscripción activa.
     */
    const unsubscribe = () => {
      /* No-op: Estado estático alcanzado */
    };
    return unsubscribe;
  }, []);

  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: VisitorHud
 * @description Orquesta la telemetría ambiental y el sistema de reputación con i18n nativa.
 */
export function VisitorHud({ dictionary }: { dictionary: Dictionary }) {
  const isMounted = useIsMounted();
  const { data: geo, isLoading: geoLoading, error: geoError } = useVisitorData();
  const [currentTime, setCurrentTime] = useState<string>('--:--');
  const [activeTab, setActiveTab] = useState<HudTab>('identity');
  
  // Estado Global de UI (Zustand)
  const isHudOpen = useUIStore((s) => s.isVisitorHudOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const closeHud = useUIStore((s) => s.closeVisitorHud);
  
  // Motores de Movimiento Físico
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Desestructuración de contratos i18n (MACS Compliance)
  const t = dictionary.visitor_hud;
  const p = dictionary.profile_page;

  /**
   * SESIÓN DE USUARIO (Sovereign Context)
   * @todo Conectar con useSovereignAuth() en Fase B.
   */
  const session: { user: SovereignUserSession | null } = { user: null };

  /**
   * CÁLCULO DE PROGRESO (Protocolo 33)
   */
  const progress: UserProgress | null = useMemo(() => 
    session.user ? calculateProgress(session.user.xp) : null, 
  [session.user]);

  /**
   * RELOJ ATÓMICO (Protocolo Heimdall)
   * Sincroniza la hora local basada en la zona horaria detectada.
   */
  useEffect(() => {
    if (!geo?.timezone || !isHudOpen) return;

    const calibrateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: geo.timezone,
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch (err) { 
        console.error("[HEIMDALL][TIME] Calibration Failure:", err); 
      }
    };

    calibrateTime();
    const interval = setInterval(calibrateTime, 30000);
    return () => clearInterval(interval);
  }, [geo?.timezone, isHudOpen]);

  /**
   * GUARDIÁN DE HIDRATACIÓN
   */
  if (!isMounted || !hasHydrated || !isHudOpen || !dictionary) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.95, x: 40 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 40 }}
        className={cn(
          "fixed top-24 right-6 z-50 w-85 cursor-grab rounded-[2.5rem] border border-white/10",
          "bg-zinc-950/60 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]",
          "overflow-hidden active:cursor-grabbing select-none"
        )}
        role="complementary"
        aria-label="Visitor HUD"
      >
        {/* 1. HEADER: NAVEGACIÓN TÁCTICA DATA-DRIVEN */}
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <div className="flex gap-4">
            {HUD_TABS.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative py-1 outline-none",
                  activeTab === tab ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab === 'identity' ? t.tab_identity : t.tab_telemetry}
                {activeTab === tab && (
                  <motion.div layoutId="hud-tab" className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={closeHud} 
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-600 transition-colors"
            aria-label="Cerrar HUD"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. BODY: CONTENIDO SOBERANO */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'identity' ? (
              <motion.div 
                key="identity-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {session.user ? (
                  /* --- VISTA: IDENTIDAD VINCULADA --- */
                  <>
                    <div className="flex items-center gap-5">
                      <div className="relative h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-pink-500 p-px">
                        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-950">
                          <User size={28} className="text-white opacity-80" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-[10px] font-bold text-primary shadow-xl">
                          {progress?.currentLevel}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{session.user.role}</p>
                        <h4 className="font-display text-xl font-bold text-white tracking-tight">{session.user.name}</h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <span>{p.xp_label}: {progress?.currentXp}</span>
                        <span className="text-zinc-600">{t.xp_next_label}: {progress?.nextLevelXp}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress?.progressPercent}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="h-full bg-linear-to-r from-primary to-pink-500" 
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* --- VISTA: INVITADO (CONVERSIÓN) --- */
                  <div className="py-4 text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                      <ScanFace size={40} className="text-zinc-700" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-display text-lg font-bold">{t.guest_title}</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed max-w-[220px] mx-auto">
                        {t.guest_description}
                      </p>
                    </div>
                    <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 shadow-2xl">
                      <LogIn size={14} /> {t.guest_cta}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-white/2 p-4 flex items-center gap-3 opacity-40">
                    <Trophy size={16} className="text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{t.stat_artifacts}</span>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/2 p-4 flex items-center gap-3 opacity-40">
                    <Zap size={16} className="text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{t.stat_streak}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* --- PESTAÑA: TELEMETRÍA (HEIMDALL) --- */
              <motion.div 
                key="telemetry-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {geoLoading ? (
                  <div className="flex flex-col items-center py-10 gap-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] animate-pulse">
                      {t.status_calibrating}
                    </span>
                  </div>
                ) : geoError ? (
                  <div className="flex flex-col items-center py-8 text-red-400 gap-2 border border-red-500/10 rounded-3xl bg-red-500/5">
                    <Shield size={24} className="opacity-50" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{t.status_error}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/2 border border-white/5">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                          <MapPin size={10} className="text-primary" /> {t.label_location}
                        </p>
                        <p className="font-bold text-sm text-zinc-100">{geo?.city || t.roaming_label}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="flex items-center justify-end gap-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                          <Clock size={10} className="text-primary" /> {t.label_time}
                        </p>
                        <p className="font-mono font-bold text-sm text-zinc-100">{currentTime}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-white/2 border border-white/5 space-y-2">
                        <p className="flex items-center gap-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                          <CloudSun size={10} /> {t.label_weather}
                        </p>
                        <p className="text-[11px] font-bold text-zinc-300 uppercase truncate">
                          {geo?.weather.temperature}°C • {t.weather_sunny}
                        </p>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/2 border border-white/5 space-y-2">
                        <p className="flex items-center gap-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                          <Activity size={10} /> {t.label_ip_visitor}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">{geo?.ip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. FOOTER: CRÉDITOS TÉCNICOS */}
        <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-[0.4em]">
            {t.footer_credits}
          </p>
          <button className="group flex items-center gap-2 text-[9px] font-bold text-white uppercase tracking-widest hover:text-primary transition-colors outline-none">
             {t.cta_explore}
            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}