// RUTA: apps/portfolio-web/src/components/ui/VisitorHud.tsx

/**
 * @file Widget de Estado del Visitante (VisitorHUD)
 * @version 16.0 - Hidratación Atómica & Resiliencia
 * @description Widget flotante con diseño glassmorphism semántico.
 *              Implementa HydrationGuard para prevenir errores de renderizado.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { CloudRain, Cloud, Sun, Loader, AlertCircle, X, ScanFace } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { useVisitorData } from '../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../lib/store/ui.store';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

const formatDMS = (decimal: number, type: 'lat' | 'lon'): string => {
  if (!decimal) return '--';
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const dir = type === 'lat' ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
  return `${d}°${m}' ${dir}`;
};

const WeatherIcon = ({ code }: { code: number }) => {
  if (code <= 3) return <Sun size={20} className="text-yellow-500" />;
  if (code >= 51 && code <= 82) return <CloudRain size={20} className="text-blue-500" />;
  return <Cloud size={20} className="text-muted-foreground" />;
};

export function VisitorHud({ dictionary }: { dictionary: Dictionary['visitor_hud'] | undefined }) {
  const { data, isLoading, error } = useVisitorData();
  const [currentTime, setCurrentTime] = useState('--:--');
  
  // Selector optimizado para evitar re-renders innecesarios
  const isHydrated = useUIStore((s) => s.hasHydrated);
  const isOpen = useUIStore((s) => s.isVisitorHudOpen);
  const closeHud = useUIStore((s) => s.closeVisitorHud);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!data?.timezone) return;
    const tick = () => {
      setCurrentTime(new Intl.DateTimeFormat('en-GB', {
        timeZone: data.timezone, hour: '2-digit', minute: '2-digit'
      }).format(new Date()));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data?.timezone]);

  // Guardia de Hidratación: Previene mismatch entre cliente y servidor
  if (!isHydrated || !isOpen || !dictionary) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag dragMomentum={false}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "fixed top-24 right-4 z-40 w-72 cursor-grab rounded-xl border border-border",
          "bg-card/95 shadow-2xl backdrop-blur-md overflow-hidden active:cursor-grabbing"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <ScanFace size={16} />
            <span className="font-display text-[10px] font-bold uppercase tracking-widest">{dictionary.label_visitor_info}</span>
          </div>
          <button 
            onClick={closeHud} 
            className="hover:text-foreground text-muted-foreground transition-colors"
            aria-label="Cerrar widget"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-4 min-h-[140px] flex flex-col justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader className="animate-spin" size={20} />
              <span className="text-[10px] font-mono">{dictionary.status_calibrating}</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 text-destructive text-xs">
              <AlertCircle size={16} /> <span>{dictionary.status_error}</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground mb-1">{dictionary.label_location}</p>
                  <p className="font-bold text-sm truncate">{data?.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase text-muted-foreground mb-1">{dictionary.label_time}</p>
                  <p className="font-mono font-bold text-sm">{currentTime}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 items-center border-t border-border pt-4">
                 <div className="flex items-center gap-2">
                    <WeatherIcon code={data?.weather.weathercode || 0} />
                    <p className="text-sm font-bold">{data?.weather.temperature}°C</p>
                 </div>
                 <div className="text-right font-mono text-[10px] text-muted-foreground">
                    {formatDMS(data?.coordinates.latitude || 0, 'lat')}<br/>
                    {formatDMS(data?.coordinates.longitude || 0, 'lon')}
                 </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}