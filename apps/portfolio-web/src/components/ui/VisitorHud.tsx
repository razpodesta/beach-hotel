/**
 * @file apps/portfolio-web/src/components/ui/VisitorHud.tsx
 * @description Centro de Mando Perimetral (Heimdall HUD). 
 *              Orquesta la telemetría ambiental y el motor de reputación 
 *              Protocolo 33 con sincronización de estado global.
 * @version 26.0 - Vercel Build Normalization & Forensic Observability
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { 
  Loader2, X, ScanFace, MapPin, Clock, CloudSun, Cloud, CloudRain,
  Activity, Shield, Trophy, Zap, ChevronRight, User, LogIn, Target
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Saneadas)
 * @pilar V: Eliminación de extensiones .js para resolución nativa en Next.js 15.
 */
import { cn } from '../../lib/utils/cn';
import { useVisitorData } from '../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../lib/store/ui.store';
import { calculateProgress } from '@metashark/protocol-33';
import type { UserProgress } from '@metashark/protocol-33';
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
}

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @pilar VIII: Resiliencia - Detección segura de montaje mediante React 19 Standards.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    const noop = () => {
      /* No-op: Estado de montaje terminal en el cliente */
    };
    return noop;
  }, []);

  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: VisitorHud
 * @description Orquesta la telemetría ambiental y el sistema de reputación.
 */
export function VisitorHud({ dictionary }: { dictionary: Dictionary }) {
  const isMounted = useIsMounted();
  const { data: geo, isLoading: geoLoading, error: geoError } = useVisitorData();
  const [currentTime, setCurrentTime] = useState<string>('--:--');
  const [activeTab, setActiveTab] = useState<HudTab>('identity');
  
  // @pilar X: Selección quirúrgica de estado global para evitar re-renders
  const isHudOpen = useUIStore((s) => s.isVisitorHudOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const closeHud = useUIStore((s) => s.closeVisitorHud);
  
  // Motores de Movimiento Físico (Pilar XII)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Desestructuración defensiva (MACS Compliance)
  const t = dictionary.visitor_hud;
  const p = dictionary.profile_page;

  /**
   * SESIÓN DE USUARIO (Handshake Bridge)
   * Preparado para inyección de auth-shield.
   */
  const sessionUser = useMemo((): SovereignUserSession | null => {
    return null; 
  }, []);

  const progress: UserProgress | null = useMemo(() => {
    if (!sessionUser) return null;
    return calculateProgress(sessionUser.xp);
  }, [sessionUser]);

  /**
   * PROCESADOR DE TELEMETRÍA: Clima Dinámico
   */
  const weatherStatus = useMemo(() => {
    if (!geo?.weather) return { icon: CloudSun, label: t.weather_cloudy };
    const code = geo.weather.weathercode;
    
    if (code === 0) return { icon: CloudSun, label: t.weather_sunny };
    if (code > 0 && code <= 3) return { icon: Cloud, label: t.weather_cloudy };
    return { icon: CloudRain, label: t.weather_rainy };
  }, [geo, t]);

  const WeatherIcon = weatherStatus.icon;

  /**
   * RELOJ ATÓMICO (Heimdall Protocol)
   */
  useEffect(() => {
    const timezone = geo?.timezone || 'America/Sao_Paulo';
    if (!isHudOpen) return;

    const calibrateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: timezone,
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch { 
        setCurrentTime('--:--');
      }
    };

    calibrateTime();
    const interval = setInterval(calibrateTime, 15000);
    return () => clearInterval(interval);
  }, [geo?.timezone, isHudOpen]);

  /**
   * PROTOCOLO HEIMDALL: Registro de Calibración
   */
  useEffect(() => {
    if (isMounted && hasHydrated) {
      console.log('[HEIMDALL][HUD] Perimetric Command Center Calibrated.');
    }
  }, [isMounted, hasHydrated]);

  // Guardián de Hidratación (Pilar VIII)
  if (!isMounted || !hasHydrated || !isHudOpen || !dictionary) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        drag
        dragMomentum={false}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.95, x: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.9, x: 40, filter: 'blur(10px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-24 right-6 z-100 w-85 cursor-grab rounded-[2.5rem] border border-white/10",
          "bg-zinc-950/70 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]",
          "overflow-hidden active:cursor-grabbing select-none transform-gpu"
        )}
        role="complementary"
        aria-label="Visitor HUD"
      >
        {/* 1. HEADER: NAVEGACIÓN TÁCTICA */}
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
                  <motion.div layoutId="hud-tab-active" className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={closeHud} 
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-600 transition-colors active:scale-90 outline-none"
            aria-label={dictionary.lucide_page.modal_close}
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. BODY: CONTENIDO SOBERANO */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'identity' ? (
              <motion.div 
                key="identity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {sessionUser ? (
                  /* --- VISTA: IDENTIDAD VINCULADA --- */
                  <>
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-pink-500 p-px shadow-2xl">
                          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-950">
                            <User size={28} className="text-white opacity-80" />
                          </div>
                        </div>
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 0px #a855f7", "0 0 15px #a855f7", "0 0 0px #a855f7"] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xl border-2 border-zinc-950"
                        >
                          {progress?.currentLevel}
                        </motion.div>
                      </div>
                      <div>
                        <p className="text-[9px] font-mono text-primary uppercase tracking-[0.3em] mb-1 font-bold">{sessionUser.role}</p>
                        <h4 className="font-display text-xl font-bold text-white tracking-tight">{sessionUser.name}</h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        <span>{p.xp_label}: {progress?.currentXp}</span>
                        <span>{t.xp_next_label}: {progress?.nextLevelXp}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
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
                    <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800 animate-spin-slow opacity-40" />
                        <ScanFace size={40} className="text-zinc-700 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-display text-lg font-bold uppercase tracking-tight">{t.guest_title}</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed max-w-[220px] mx-auto italic font-light">
                        {t.guest_description}
                      </p>
                    </div>
                    <button className="group w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all active:scale-95 shadow-2xl">
                      <LogIn size={14} className="group-hover:rotate-12 transition-transform" /> {t.guest_cta}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-white/2 p-4 flex flex-col gap-2 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                    <Trophy size={16} className="text-zinc-600" />
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t.stat_artifacts}</span>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/2 p-4 flex flex-col gap-2 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                    <Zap size={16} className="text-zinc-600" />
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t.stat_streak}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* --- PESTAÑA: TELEMETRÍA (HEIMDALL) --- */
              <motion.div 
                key="telemetry"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {geoLoading ? (
                  <div className="flex flex-col items-center py-10 gap-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] animate-pulse">
                      {t.status_calibrating}
                    </span>
                  </div>
                ) : geoError ? (
                  <div className="flex flex-col items-center py-8 text-red-400 gap-4 border border-red-500/10 rounded-3xl bg-red-500/5">
                    <Shield size={24} className="opacity-50" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]">{t.status_error}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 transform-gpu">
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/2 border border-white/5">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                          <MapPin size={10} className="text-primary" /> {t.label_location}
                        </p>
                        <p className="font-bold text-sm text-zinc-100">{geo?.city || t.roaming_label}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="flex items-center justify-end gap-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                          <Clock size={10} className="text-primary" /> {t.label_time}
                        </p>
                        <p className="font-mono font-bold text-sm text-zinc-100">{currentTime}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-white/2 border border-white/5 space-y-2">
                        <p className="flex items-center gap-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                          <WeatherIcon size={12} className="text-primary" /> {t.label_weather}
                        </p>
                        <p className="text-[11px] font-bold text-zinc-300 uppercase truncate">
                          {geo?.weather.temperature}°C • {weatherStatus.label}
                        </p>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/2 border border-white/5 space-y-2">
                        <p className="flex items-center gap-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                          <Activity size={12} className="text-primary" /> {t.label_ip_visitor}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">{geo?.ip}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-3xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                        <div className="relative">
                           <Target size={16} className="text-primary" />
                           <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full animate-pulse" />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.2em] leading-tight">
                            {t.precision_sync_label}
                        </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. FOOTER: CRÉDITOS TÉCNICOS */}
        <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-[0.5em] font-medium">
            {t.footer_credits}
          </p>
          <button className="group flex items-center gap-2 text-[9px] font-bold text-white uppercase tracking-widest hover:text-primary transition-all outline-none">
             {t.cta_explore}
            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}