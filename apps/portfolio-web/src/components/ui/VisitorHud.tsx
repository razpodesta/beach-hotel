/**
 * @file VisitorHud.tsx
 * @description Aparato de telemetría inmersiva (Heimdall HUD). 
 *              Refactorizado para cumplir con el Master Schema y estándares de Tailwind v4.
 * @version 18.1 - Master Contract Sync & Z-Index Refinement
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { 
  Loader2, X, ScanFace, MapPin, 
  Clock, CloudSun, Activity, Shield 
} from 'lucide-react';

import { cn } from '../../lib/utils/cn';
import { useVisitorData } from '../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../lib/store/ui.store';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * Hook de Hidratación de Élite
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => { /* No-op teardown */ };
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: VisitorHud
 */
export function VisitorHud({ dictionary }: { dictionary: Dictionary['visitor_hud'] }) {
  const isMounted = useIsMounted();
  const { data, isLoading, error } = useVisitorData();
  const [currentTime, setCurrentTime] = useState('--:--');
  
  const isHudOpen = useUIStore((s) => s.isVisitorHudOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const closeHud = useUIStore((s) => s.closeVisitorHud);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Orquestador de Reloj Localizado
  useEffect(() => {
    if (!data?.timezone || !isHudOpen) return;

    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: data.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch (e) {
        console.warn("[HEIMDALL][TIME] Calibration failed:", e);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, [data?.timezone, isHudOpen]);

  // Mapeo de Clima Semántico
  const weatherLabel = useMemo(() => {
    if (!data?.weather) return '--';
    const code = data.weather.weathercode;
    if (code === 0) return dictionary.weather_sunny;
    if (code > 0 && code < 4) return dictionary.weather_cloudy;
    return dictionary.weather_rainy;
  }, [data, dictionary]);

  // @pilar VIII: Guardia de Seguridad (Hydration & Contract Check)
  if (!isMounted || !hasHydrated || !isHudOpen || !dictionary) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={cn(
          /**
           * @pilar VII: Theming Soberano.
           * @fix: Z-index ajustado a clase canónica sugerida por el linter.
           */
          "fixed top-24 right-6 z-50 w-80 cursor-grab rounded-3xl border border-white/10",
          "bg-zinc-950/40 backdrop-blur-2xl shadow-3xl overflow-hidden active:cursor-grabbing"
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ScanFace size={16} className="text-purple-400" />
              <div className="absolute inset-0 bg-purple-400/20 blur-sm animate-pulse" />
            </div>
            <span className="font-display text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-100">
              {dictionary.label_visitor_info}
            </span>
          </div>
          <button onClick={closeHud} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-500">
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="animate-spin text-purple-500" size={24} />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                {dictionary.status_calibrating}
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 text-red-400 gap-2">
              <Shield size={24} className="opacity-50" />
              <span className="text-[10px] font-mono uppercase">{dictionary.status_error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    <MapPin size={10} className="text-purple-500" /> {dictionary.label_location}
                  </p>
                  <p className="font-bold text-sm text-zinc-100">{data?.city || 'Remote'}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="flex items-center justify-end gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    <Clock size={10} className="text-purple-500" /> {dictionary.label_time}
                  </p>
                  <p className="font-mono font-bold text-sm text-zinc-100">{currentTime}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    <CloudSun size={10} /> {dictionary.label_weather}
                  </p>
                  <p className="text-[11px] font-bold text-zinc-300 uppercase">
                    {data?.weather.temperature}°C • {weatherLabel}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="flex items-center justify-end gap-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    <Activity size={10} /> {dictionary.label_ip_visitor}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">{data?.ip}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                  {dictionary.coords_format}: {data?.coordinates.latitude.toFixed(2)}, {data?.coordinates.longitude.toFixed(2)}
                </p>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-black/20 flex justify-center">
          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-[0.3em]">
            {dictionary.footer_credits}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}