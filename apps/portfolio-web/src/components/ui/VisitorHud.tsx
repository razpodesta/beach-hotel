/**
 * @file apps/portfolio-web/src/components/ui/VisitorHud.tsx
 * @description Aparato de telemetría del visitante (Heimdall HUD).
 *              Proyecta ubicación, clima real y tiempo localizado mediante APIs soberanas.
 * @version 17.1 - ESLint Hygiene & Optional Catch Binding
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { 
  CloudRain, Cloud, Sun, Loader, AlertCircle, X, 
  ScanFace, CloudLightning, CloudSnow, Wind, Map 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';
import { useVisitorData } from '../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../lib/store/ui.store';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * UTILITY: formatDMS
 * Convierte coordenadas decimales a Grados, Minutos y Segundos.
 */
const formatDMS = (decimal: number, type: 'lat' | 'lon'): string => {
  if (decimal === undefined || decimal === null) return '--°--\'';
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const dir = type === 'lat' ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
  return `${d}°${m}' ${dir}`;
};

/**
 * SUB-APARATO: WeatherIcon
 * Implementa mapeo exhaustivo de códigos WMO.
 */
const WeatherIcon = ({ code, size = 20 }: { code: number; size?: number }) => {
  const config = { size, className: "shrink-0 transition-all duration-500" };
  
  if (code === 0) return <Sun {...config} className="text-yellow-400" />;
  if (code >= 1 && code <= 3) return <Cloud {...config} className="text-zinc-400" />;
  if (code === 45 || code === 48) return <Wind {...config} className="text-zinc-500" />;
  if (code >= 51 && code <= 67) return <CloudRain {...config} className="text-blue-400" />;
  if (code >= 71 && code <= 77) return <CloudSnow {...config} className="text-white" />;
  if (code >= 80 && code <= 82) return <CloudRain {...config} className="text-blue-600" />;
  if (code >= 95) return <CloudLightning {...config} className="text-purple-500" />;
  
  return <Sun {...config} className="text-yellow-400" />;
};

/**
 * Hook de Hidratación de Élite
 * @pilar X: Higiene de Código. Se documenta la suscripción no-op para el linter.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    // Suscripción estática: No requiere limpieza de recursos externos
    return () => { /* No-op Unsubscribe */ };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function VisitorHud({ dictionary }: { dictionary: Dictionary['visitor_hud'] }) {
  const isMounted = useIsMounted();
  const { data, isLoading, error } = useVisitorData();
  const [currentTime, setCurrentTime] = useState('--:--');
  
  const isOpen = useUIStore((s) => s.isVisitorHudOpen);
  const closeHud = useUIStore((s) => s.closeVisitorHud);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  /**
   * ORQUESTADOR DEL TIEMPO REAL
   * Sincroniza el reloj con la zona horaria real detectada del visitante.
   */
  useEffect(() => {
    if (!data?.timezone || !isOpen) return;

    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: data.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch {
        /**
         * @pilar X: Higiene. Se utiliza Optional Catch Binding.
         */
        console.warn("[HEIMDALL][TIME] Error de resolución de zona horaria.");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [data?.timezone, isOpen]);

  // @pilar VIII: Guardia de Hidratación Atómica
  if (!isMounted || !isOpen || !dictionary) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-24 right-4 z-40 w-80 cursor-grab rounded-2xl border",
          "bg-zinc-950/80 border-white/10 shadow-3xl backdrop-blur-2xl overflow-hidden active:cursor-grabbing",
          "selection:bg-purple-500/30"
        )}
      >
        {/* Cabecera de Telemetría */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ScanFace size={16} className="text-purple-400" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500 rounded-full -z-10"
              />
            </div>
            <span className="font-display text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-100">
              {dictionary.label_visitor_info}
            </span>
          </div>
          <button 
            onClick={closeHud} 
            className="p-1 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-all outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
            aria-label="Cerrar telemetría"
          >
            <X size={16} />
          </button>
        </div>

        {/* Panel de Datos Reales */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader className="animate-spin text-purple-500" size={24} />
              <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase animate-pulse">
                {dictionary.status_calibrating}
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={18} /> 
              <span className="font-medium">{dictionary.status_error}</span>
            </div>
          ) : (
            <>
              {/* Bloque Superior: Lugar y Tiempo */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-600 font-bold">{dictionary.label_location}</p>
                  <div className="flex items-center gap-2">
                    <Map size={12} className="text-purple-500" />
                    <p className="font-bold text-sm text-zinc-100 truncate" title={data?.city}>
                      {data?.city}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-600 font-bold">{dictionary.label_time}</p>
                  <p className="font-mono font-bold text-sm text-zinc-100 tracking-wider">
                    {currentTime}
                  </p>
                </div>
              </div>
              
              {/* Bloque Inferior: Clima y Navegación */}
              <div className="grid grid-cols-2 gap-6 items-center border-t border-white/5 pt-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <WeatherIcon code={data?.weather.weathercode || 0} size={22} />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-lg font-bold text-zinc-100 leading-none">
                        {data?.weather.temperature}°C
                      </p>
                      <span className="text-[8px] text-zinc-500 uppercase font-bold mt-1 tracking-tighter">
                         {data?.weather.weathercode === 0 ? dictionary.weather_sunny : 'Real Time'}
                      </span>
                    </div>
                 </div>
                 <div className="text-right font-mono text-[9px] leading-relaxed text-zinc-500 tracking-tight">
                    <span className="text-zinc-700">LAT:</span> {formatDMS(data?.coordinates.latitude || 0, 'lat')}<br/>
                    <span className="text-zinc-700">LON:</span> {formatDMS(data?.coordinates.longitude || 0, 'lon')}
                 </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Técnico */}
        <div className="px-6 py-3 bg-white/2 border-t border-white/5 flex justify-between items-center">
            <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
              IP: {data?.ip === 'SIMULATION_MODE' ? 'Private' : (data?.ip || '0.0.0.0')}
            </span>
            <span className="text-[7px] font-bold text-zinc-800 uppercase tracking-[0.2em]">
              {dictionary.footer_credits}
            </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}