/**
 * @file apps/portfolio-web/src/components/ui/VisitorHud.tsx
 * @description Aparato de telemetría del visitante (Heimdall HUD).
 *              Saneado: Eliminación de código muerto y cumplimiento estricto de linter.
 * @version 17.3 - Lint Free Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Loader, X, ScanFace } from 'lucide-react';

import { cn } from '../../lib/utils/cn';
import { useVisitorData } from '../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../lib/store/ui.store';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * Hook de Hidratación de Élite:
 * @pilar X: Higiene de Código.
 * Se evita el empty-function con un bloque comentado explícito.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => {
      // Intencionalmente vacío: Estado de montaje estático en cliente.
      // Se mantiene el bloque para satisfacer el linter no-empty-function.
    };
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
        className={cn(
          "fixed top-24 right-4 z-40 w-80 cursor-grab rounded-2xl border",
          "bg-zinc-950/80 border-white/10 shadow-3xl backdrop-blur-2xl overflow-hidden active:cursor-grabbing"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ScanFace size={16} className="text-purple-400" />
            <span className="font-display text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-100">
              {dictionary.label_visitor_info}
            </span>
          </div>
          <button onClick={closeHud} className="p-1 rounded-full hover:bg-white/10 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <Loader className="animate-spin text-purple-500" size={24} />
            </div>
          ) : error ? (
            <div className="text-red-400 text-xs text-center">{dictionary.status_error}</div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
                <p className="font-bold text-sm text-zinc-100 truncate">{data?.city}</p>
                <p className="font-mono font-bold text-sm text-zinc-100 text-right">{currentTime}</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}