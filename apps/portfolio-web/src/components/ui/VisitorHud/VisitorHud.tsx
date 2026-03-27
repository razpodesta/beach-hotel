/**
 * @file VisitorHud.tsx
 * @description Orquestador Soberano del Centro de Mando Perimetral (Heimdall HUD).
 *              Refactorizado: Cero avisos de linting, clases canónicas y SRP.
 * @version 29.0 - Production Ready (Lint Clean)
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { cn } from '../../../lib/utils/cn';
import { useVisitorData } from '../../../lib/hooks/use-visitor-data';
import { useUIStore } from '../../../lib/store/ui.store';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

import { HudHeader, type HudTab } from './HudHeader';
import { HudIdentity } from './HudIdentity';
import { HudTelemetry } from './HudTelemetry';
import { HudGuestView } from './HudGuestView';

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @pilar VIII: Resiliencia ante SSR.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    /**
     * @description Función de limpieza obligatoria para el linter.
     * El estado de montaje es terminal en el cliente.
     */
    return () => {
      /* No-op cleanup */
    };
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function VisitorHud({ dictionary }: { dictionary: Dictionary }) {
  const isMounted = useIsMounted();
  const { data: geo, isLoading: geoLoading, error: geoError } = useVisitorData();
  const [activeTab, setActiveTab] = useState<HudTab>('identity');
  
  const isHudOpen = useUIStore((s) => s.isVisitorHudOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const closeHud = useUIStore((s) => s.closeVisitorHud);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const t = dictionary.visitor_hud;

  /**
   * SESIÓN DE USUARIO (Protocolo 33 Ready)
   * Placeholder para la futura inyección del authStore.
   */
  const sessionUser = null; 

  if (!isMounted || !hasHydrated || !isHudOpen || !dictionary) return null;

  return (
    <AnimatePresence>
      <motion.aside
        drag
        dragMomentum={false}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.95, x: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.9, x: 40, filter: 'blur(10px)' }}
        className={cn(
          "fixed top-24 right-6 z-100 w-85 cursor-grab rounded-[2.5rem] border border-white/10",
          "bg-zinc-950/80 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]",
          "overflow-hidden active:cursor-grabbing select-none"
        )}
        role="complementary"
        aria-label="Sovereign Telemetry HUD"
      >
        <HudHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onClose={closeHud} 
          labels={{ identity: t.tab_identity, telemetry: t.tab_telemetry }} 
        />

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'identity' ? (
              sessionUser ? (
                <HudIdentity 
                  key="id-linked"
                  user={sessionUser} 
                  dictionary={dictionary} 
                />
              ) : (
                <HudGuestView 
                  key="id-guest"
                  t={t} 
                />
              )
            ) : (
              <HudTelemetry 
                key="telemetry"
                geo={geo} 
                loading={geoLoading} 
                error={!!geoError} 
                t={t} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER DE INFRAESTRUCTRURA */}
        <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <p className="text-[8px] font-mono text-zinc-800 uppercase tracking-[0.5em] font-medium">
            {t.footer_credits}
          </p>
          <button className="group flex items-center gap-2 text-[9px] font-bold text-white uppercase tracking-widest hover:text-primary transition-all outline-none">
             {t.cta_explore}
            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}