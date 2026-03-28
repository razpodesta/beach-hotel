/**
 * @file HudTelemetry.tsx
 * @description Módulo de telemetría ambiental y geolocalización de alta gama.
 *              Refactorizado: Centralización de lógica de logs (Heimdall),
 *              mapeo de colores semánticos OKLCH y optimización React 19.
 * @version 4.0 - Sovereign Precision & Semantic Colors
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, ShieldCheck, MapPin, Clock, CloudSun, Cloud, 
  CloudRain, Activity, Target, Thermometer 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { cn } from '../../../lib/utils/cn';
import type { VisitorData } from '../../../lib/hooks/use-visitor-data';
import type { VisitorHudDictionary } from '../../../lib/schemas/visitor_hud.schema';

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

/**
 * APARATO: HudTelemetry
 * @description Procesa y renderiza telemetría en tiempo real con adaptabilidad atmosférica.
 */
export function HudTelemetry({ geo, loading, error, t }: HudTelemetryProps) {
  const [currentTime, setCurrentTime] = useState<string>('--:--');

  /**
   * RESOLUCIÓN METEOROLÓGICA (WMO Standard)
   * @description Determina iconos y estados visuales basados en la data del sensor.
   */
  const weatherStatus = useMemo(() => {
    if (!geo?.weather) return { icon: CloudSun, label: t.weather_cloudy, color: 'text-primary' };
    
    const code = geo.weather.weathercode;
    
    if (code === 0) return { icon: CloudSun, label: t.weather_sunny, color: 'text-yellow-500' };
    if (code > 0 && code <= 3) return { icon: Cloud, label: t.weather_cloudy, color: 'text-muted-foreground' };
    
    return { icon: CloudRain, label: t.weather_rainy, color: 'text-blue-400' };
  }, [geo, t]);

  /**
   * PROTOCOLO HEIMDALL: Observabilidad Forense
   * @pilar IV: Rastro de sincronización de datos ambientales.
   */
  useEffect(() => {
    if (geo) {
      console.group(`[HEIMDALL][TELEMETRY] Sync Event: ${Date.now()}`);
      console.log(`Location: ${geo.city} | Lat: ${geo.coordinates.latitude}`);
      console.log(`Weather: ${geo.weather.temperature}°C | Status: ${weatherStatus.label}`);
      console.groupEnd();
    }
  }, [geo, weatherStatus.label]);

  /**
   * MOTOR DE SINCRONIZACIÓN HORARIA
   * @description Calibra el reloj atómico del HUD según la zona horaria del huésped.
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
    const interval = setInterval(calibrateTime, 15000); // Optimizado a 15s para performance
    return () => clearInterval(interval);
  }, [geo?.timezone]);

  // --- ESCENARIOS DE RESILIENCIA (Pilar VIII) ---

  if (loading) return (
    <div className="flex flex-col items-center py-12 gap-5" role="status">
      <div className="relative">
        <Loader2 className="animate-spin text-primary" size={32} />
        <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-4xl animate-pulse" />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
        {t.status_calibrating}
      </span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center py-10 text-accent gap-4 border border-accent/10 rounded-4xl bg-accent/5">
      <Activity size={24} className="opacity-50 animate-pulse" />
      <span className="text-[9px] font-bold uppercase tracking-[0.4em]">{t.status_error}</span>
    </div>
  );

  const WeatherIcon = weatherStatus.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-5 transform-gpu"
    >
      {/* 1. SECCIÓN: GEOLOCALIZACIÓN Y TIEMPO (Atmosphere Aware) */}
      <div className="flex items-center justify-between p-6 rounded-4xl bg-background/40 border border-border/50 backdrop-blur-md">
        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
            <MapPin size={12} className="text-primary" /> {t.label_location}
          </p>
          <p className="font-display font-bold text-base text-foreground leading-none">
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

      {/* 2. GRID: CLIMA E IDENTIDAD DE RED */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-4xl bg-surface border border-border/40 space-y-3 transition-all duration-700 hover:border-primary/30">
          <p className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
            <WeatherIcon size={14} className={weatherStatus.color} /> {t.label_weather}
          </p>
          <div className="text-xs font-bold text-foreground uppercase truncate">
            <span className="flex items-center gap-2">
               <Thermometer size={14} className="text-primary/60" />
               {geo?.weather.temperature}°C <span className="opacity-30">•</span> {weatherStatus.label}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-4xl bg-surface border border-border/40 space-y-3 transition-all duration-700 hover:border-success/30">
          <p className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
            <ShieldCheck size={14} className="text-success" /> {t.label_ip_visitor}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground truncate leading-none pt-1">
            {geo?.ip}
          </p>
        </div>
      </div>
      
      {/* 3. FOOTER: ESTADO DE SINCRONIZACIÓN (MEA/UX) */}
      <div className="p-5 rounded-4xl bg-primary/5 border border-primary/20 flex items-center gap-4 group">
        <div className="relative flex h-3 w-3">
          <Target size={16} className="text-primary animate-pulse group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] leading-tight group-hover:text-foreground transition-colors">
          {t.precision_sync_label}
        </span>
      </div>
    </motion.div>
  );
}