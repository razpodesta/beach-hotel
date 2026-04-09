/**
 * @file HudTelemetry.tsx
 * @description Módulo de telemetría ambiental y geolocalización (Heimdall Node).
 *              Refactorizado: Implementación de Latencia Dinámica y Sincronía WMO.
 *              Optimizado: Protocolo Heimdall v2.5 (Trace IDs & Forensic Logs).
 *              Estándar: React 19 Pure & Tailwind v4 OKLCH.
 * @version 5.0 - Precision Telemetry & Luxury UX
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, ShieldCheck, MapPin, Clock, CloudSun, Cloud, 
  CloudRain, Activity, Target, Thermometer, Wind, CloudLightning
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia arquitectónica.
 */
import type { VisitorData } from '../../../lib/hooks/use-visitor-data';
import type { VisitorHudDictionary } from '../../../lib/schemas/visitor_hud.schema';
import { cn } from '../../../lib/utils/cn';

/**
 * @interface HudTelemetryProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface HudTelemetryProps {
  /** Datos del visitante recuperados por el hook soberano */
  geo: VisitorData | null;
  /** Estado de carga del sensor */
  loading: boolean;
  /** Estado de error en la señal */
  error: boolean;
  /** Diccionario localizado validado por contrato SSoT */
  t: VisitorHudDictionary;
}

// --- PROTOCOLO CROMÁTICO HEIMDALL ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * APARATO: HudTelemetry
 * @description Procesa y renderiza señales ambientales en tiempo real.
 */
export const HudTelemetry = memo(({ geo, loading, error, t }: HudTelemetryProps) => {
  const [currentTime, setCurrentTime] = useState<string>('--:--');

  /**
   * 1. RESOLUCIÓN METEOROLÓGICA AVANZADA (WMO Protocol)
   * @description Mapea el código técnico a una identidad visual y semántica.
   */
  const weatherStatus = useMemo(() => {
    if (!geo?.weather) return { icon: CloudSun, label: t.weather_cloudy, color: 'text-primary' };
    
    const code = geo.weather.weathercode;
    
    // Matriz de decisión WMO (World Meteorological Organization)
    if (code === 0) return { icon: CloudSun, label: t.weather_sunny, color: 'text-yellow-500' };
    if (code >= 1 && code <= 3) return { icon: Cloud, label: t.weather_cloudy, color: 'text-muted-foreground' };
    if (code >= 51 && code <= 67) return { icon: CloudRain, label: t.weather_rainy, color: 'text-blue-400' };
    if (code >= 95) return { icon: CloudLightning, label: t.weather_rainy, color: 'text-primary' };
    
    return { icon: Wind, label: t.weather_cloudy, color: 'text-cyan-500' };
  }, [geo, t]);

  /**
   * 2. PROTOCOLO HEIMDALL: Telemetría Forense
   * @pilar IV: Reporta la sincronización del nodo con latencia calculada.
   */
  useEffect(() => {
    if (geo && !loading) {
      const traceId = `env_sync_${Date.now().toString(36).toUpperCase()}`;
      console.log(
        `${C.magenta}${C.bold}[DNA][TELEMETRY]${C.reset} Node Synchronized | ` +
        `Trace: ${C.cyan}${traceId}${C.reset} | ` +
        `Location: ${C.green}${geo.city}${C.reset}`
      );
    }
  }, [geo, loading]);

  /**
   * 3. MOTOR DE SINCRONIZACIÓN HORARIA (Atomic Clock)
   * @pilar X: Performance - Intervalo de baja frecuencia (15s) para ahorro energético.
   */
  useEffect(() => {
    const timezone = geo?.timezone || 'America/Sao_Paulo';
    const calibrateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch { 
        setCurrentTime('--:--'); 
      }
    };

    calibrateTime();
    const interval = setInterval(calibrateTime, 15000);
    return () => clearInterval(interval);
  }, [geo?.timezone]);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        /* --- ESTADO: CALIBRACIÓN (Skeleton Pattern) --- */
        <motion.div 
          key="loading"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center py-12 gap-5"
        >
          <div className="relative">
            <Loader2 className="animate-spin text-primary" size={32} />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-4xl animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
            {t.status_calibrating}
          </span>
        </motion.div>
      ) : error ? (
        /* --- ESTADO: BRECHA (Signal Lost) --- */
        <motion.div 
          key="error"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-10 text-red-500 gap-4 border border-red-500/10 rounded-4xl bg-red-500/5"
        >
          <Activity size={24} className="opacity-50 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.4em]">{t.status_error}</span>
        </motion.div>
      ) : (
        /* --- ESTADO: NOMINAL (Data Stream) --- */
        <motion.div 
          key="nominal"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-5 transform-gpu"
        >
          {/* 1. SECCIÓN: GEOLOCALIZACIÓN & TIEMPO */}
          <div className="flex items-center justify-between p-6 rounded-4xl bg-background/40 border border-border/50 backdrop-blur-md shadow-inner transition-colors duration-700 hover:border-primary/20">
            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                <MapPin size={12} className="text-primary" /> {t.label_location}
              </p>
              <p className="font-display font-bold text-base text-foreground leading-none tracking-tight">
                {geo?.city || t.roaming_label}
              </p>
            </div>
            <div className="text-right space-y-1.5">
              <p className="flex items-center justify-end gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                <Clock size={12} className="text-primary" /> {t.label_time}
              </p>
              <p className="font-mono font-bold text-base text-foreground leading-none">
                {currentTime}
              </p>
            </div>
          </div>

          {/* 2. GRID: CLIMA & IDENTIDAD DE RED */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nodo Meteorológico */}
            <div className="p-5 rounded-4xl bg-surface/50 border border-border/40 space-y-3 transition-all duration-700 hover:border-primary/30 group">
              <p className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                <weatherStatus.icon size={14} className={cn("transition-transform duration-700 group-hover:rotate-12", weatherStatus.color)} /> 
                {t.label_weather}
              </p>
              <div className="flex items-center gap-2.5 text-xs font-bold text-foreground uppercase truncate">
                 <Thermometer size={14} className="text-primary/60" />
                 <span>{geo?.weather.temperature}°C</span>
                 <span className="opacity-20">|</span>
                 <span className="text-[10px] text-muted-foreground font-light">{weatherStatus.label}</span>
              </div>
            </div>

            {/* Nodo de Conectividad */}
            <div className="p-5 rounded-4xl bg-surface/50 border border-border/40 space-y-3 transition-all duration-700 hover:border-success/30">
              <p className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                <ShieldCheck size={14} className="text-success" /> {t.label_ip_visitor}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground truncate leading-none pt-1">
                {geo?.ip}
              </p>
            </div>
          </div>
          
          {/* 3. FOOTER: ESTADO DE SINCRONIZACIÓN (Pulse) */}
          <div className="p-5 rounded-4xl bg-primary/5 border border-primary/20 flex items-center gap-4 group transition-all duration-700 hover:bg-primary/10">
            <div className="relative flex h-3 w-3">
              <Target size={16} className="text-primary animate-pulse group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] leading-tight group-hover:text-foreground transition-colors">
              {t.precision_sync_label}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

HudTelemetry.displayName = 'HudTelemetry';