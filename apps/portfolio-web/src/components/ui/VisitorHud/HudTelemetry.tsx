/**
 * @file HudTelemetry.tsx
 * @description Módulo de datos ambientales y geolocalización.
 * @version 2.0 - Zero Any Compliance
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, Shield, MapPin, Clock, CloudSun, Cloud, 
  CloudRain, Activity, Target 
} from 'lucide-react';
import type { VisitorData } from '../../../lib/hooks/use-visitor-data';
import type { VisitorHudDictionary } from '../../../lib/schemas/visitor_hud.schema';

interface HudTelemetryProps {
  geo: VisitorData | null;
  loading: boolean;
  error: boolean;
  /** Diccionario tipado por contrato Zod */
  t: VisitorHudDictionary;
}

export function HudTelemetry({ geo, loading, error, t }: HudTelemetryProps) {
  const [currentTime, setCurrentTime] = useState<string>('--:--');

  const weatherStatus = useMemo(() => {
    if (!geo?.weather) return { icon: CloudSun, label: t.weather_cloudy };
    const code = geo.weather.weathercode;
    if (code === 0) return { icon: CloudSun, label: t.weather_sunny };
    if (code > 0 && code <= 3) return { icon: Cloud, label: t.weather_cloudy };
    return { icon: CloudRain, label: t.weather_rainy };
  }, [geo, t]);

  const WeatherIcon = weatherStatus.icon;

  useEffect(() => {
    const timezone = geo?.timezone || 'America/Sao_Paulo';
    const calibrateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch { setCurrentTime('--:--'); }
    };
    calibrateTime();
    const interval = setInterval(calibrateTime, 15000);
    return () => clearInterval(interval);
  }, [geo?.timezone]);

  if (loading) return (
    <div className="flex flex-col items-center py-10 gap-4">
      <Loader2 className="animate-spin text-primary" size={24} />
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] animate-pulse">
        {t.status_calibrating}
      </span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center py-8 text-red-400 gap-4 border border-red-500/10 rounded-3xl bg-red-500/5">
      <Shield size={24} className="opacity-50" />
      <span className="text-[9px] font-bold uppercase tracking-[0.4em]">{t.status_error}</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
        <Target size={16} className="text-primary animate-pulse" />
        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.2em] leading-tight">
          {t.precision_sync_label}
        </span>
      </div>
    </motion.div>
  );
}