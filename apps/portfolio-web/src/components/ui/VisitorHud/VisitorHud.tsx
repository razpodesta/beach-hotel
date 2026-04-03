/**
 * @file VisitorHud.tsx
 * @description Orquestador Soberano del Centro de Mando Perimetral (Heimdall HUD).
 *              Refactorizado: Sincronización real con la bóveda de estado (Zustand),
 *              cableado del Protocolo 33 para usuarios autenticados y 
 *              purificación de linter para funciones vacías.
 * @version 32.0 - Active Session Sync & Linter Pure
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ChevronRight, ShieldAlert } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
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
 * @pilar X: Garantiza el renderizado sincronizado sin warnings de ESLint.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => { void 0; }; // @fix: Resuelve 'no-empty-function'
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: VisitorHud
 * @description Panel flotante de telemetría. Reacciona dinámicamente a data-theme
 *              y al estado criptográfico del usuario.
 */
export function VisitorHud({ dictionary }: { dictionary: Dictionary }) {
  const isMounted = useIsMounted();
  const { data: geo, isLoading: geoLoading, error: geoError } = useVisitorData();
  const [activeTab, setActiveTab] = useState<HudTab>('identity');
  
  // Conexión a la Bóveda de Estado Global
  const { isVisitorHudOpen, hasHydrated, closeVisitorHud, session } = useUIStore();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  /**
   * PROTOCOLO HEIMDALL: Trazabilidad Forense
   */
  useEffect(() => {
    if (isVisitorHudOpen && isMounted) {
      console.log(`[HEIMDALL][HUD] Monitor Active. Trace: ${new Date().toISOString()}`);
    }
  }, [isVisitorHudOpen, isMounted]);

  const t = dictionary.visitor_hud;

  /**
   * SESIÓN DE USUARIO (Protocolo 33 Sincronizado)
   * @description Si existe una sesión en el store, la mapeamos al contrato esperado 
   *              por el HudIdentity, dando vida al sistema de gamificación.
   */
  const sessionUser = session ? {
    name: session.email.split('@')[0], // Extrae el nombre del correo como fallback visual
    role: session.role,
    xp: session.xp ?? 0
  } : null;

  if (!isMounted || !hasHydrated || !isVisitorHudOpen || !dictionary) return null;

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
          "fixed top-24 right-6 z-100 w-85 cursor-grab rounded-[2.5rem] border",
          "bg-surface/80 backdrop-blur-2xl border-border shadow-3xl",
          "overflow-hidden active:cursor-grabbing select-none transform-gpu transition-colors duration-700"
        )}
        role="complementary"
        aria-label="Sovereign Telemetry HUD"
      >
        <HudHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onClose={closeVisitorHud} 
          labels={{ 
            identity: t.tab_identity, 
            telemetry: t.tab_telemetry,
            close_action: dictionary.lucide_page.modal_close // SSoT Terminológico
          }} 
        />

        <div className="p-8">
          <AnimatePresence mode="wait">
            {geoError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mb-6"
              >
                <ShieldAlert size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.status_error}</span>
              </motion.div>
            )}

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
        <footer className="px-8 py-5 bg-background/40 border-t border-border flex items-center justify-between">
          <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.5em] font-medium">
            {t.footer_credits}
          </p>
          <button 
            className="group flex items-center gap-2 text-[9px] font-bold text-foreground/60 uppercase tracking-widest hover:text-primary transition-all outline-none"
            aria-label={t.cta_explore}
          >
             {t.cta_explore}
            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </footer>
      </motion.aside>
    </AnimatePresence>
  );
}