/**
 * @file apps/portfolio-web/src/components/ui/VisitorHud/VisitorHud.tsx
 * @description Orquestador Soberano del Centro de Mando Perimetral (Heimdall HUD).
 *              Refactorizado: Resolución de TS2304 (Variable Reference Fix), 
 *              sincronización de sesión P33 y purificación de Linter.
 * 
 * @version 33.1 - Type Reference Fixed & Chromatic Telemetry
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ChevronRight, ShieldAlert } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
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
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5
 */
const C = {
  reset: '\x1b[0m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
} as const;

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @description Garantiza el renderizado sincronizado sin warnings de ESLint.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => { 
      /* No-op: Cleanup de suscripción estática */
    };
  }, []);
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: VisitorHud
 * @description Panel flotante de telemetría y gestión de identidad digital.
 */
export function VisitorHud({ dictionary }: { dictionary: Dictionary }) {
  const isMounted = useIsMounted();
  const { data: geo, isLoading: geoLoading, error: geoError } = useVisitorData();
  const [activeTab, setActiveTab] = useState<HudTab>('identity');
  
  // Selección quirúrgica de estado global (Pilar X: Performance)
  const isVisitorHudOpen = useUIStore((s) => s.isVisitorHudOpen);
  const hasHydrated = useUIStore((s) => s.hasHydrated);
  const closeVisitorHud = useUIStore((s) => s.closeVisitorHud);
  const session = useUIStore((s) => s.session);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  /**
   * PROTOCOLO HEIMDALL: Registro de Actividad
   * @fix TS-Lint: Uso de console.info con constantes cromáticas autorizadas.
   */
  useEffect(() => {
    if (isVisitorHudOpen && isMounted) {
      const traceId = `hud_pulse_${Date.now().toString(36).toUpperCase()}`;
      console.info(
        `${C.magenta}${C.bold}[DNA][TELEMETRY]${C.reset} HUD Terminal active | ` +
        `Trace: ${C.cyan}${traceId}${C.reset}`
      );
    }
  }, [isVisitorHudOpen, isMounted]);

  const t = dictionary.visitor_hud;

  /**
   * SESIÓN DE USUARIO (Protocolo 33 Sincronizado)
   * @description Mapea la sesión del store al contrato visual del HUD.
   */
  const sessionUser = session ? {
    name: session.email.split('@')[0],
    role: session.role,
    xp: session.xp ?? 0
  } : null;

  // Renderizado defensivo (Pilar VIII)
  if (!isMounted || !hasHydrated || !isVisitorHudOpen || !dictionary) return null;

  return (
    <AnimatePresence>
      <motion.aside
        drag
        dragMomentum={false}
        dragConstraints={{ left: -500, right: 0, top: 0, bottom: 800 }}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.95, x: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.9, x: 40, filter: 'blur(10px)' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-24 right-6 z-100 w-85 cursor-grab rounded-[2.5rem] border",
          "bg-surface/80 backdrop-blur-2xl border-border shadow-3xl",
          "overflow-hidden active:cursor-grabbing select-none transform-gpu transition-colors duration-700"
        )}
        role="complementary"
        aria-label="Sovereign Telemetry HUD"
      >
        {/* Cabecera de Navegación del HUD */}
        <HudHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onClose={closeVisitorHud} 
          labels={{ 
            identity: t.tab_identity, 
            telemetry: t.tab_telemetry,
            close_action: dictionary.lucide_page.modal_close
          }} 
        />

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Indicador de Brecha de Señal (Error) */}
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
                  user={sessionUser} // @fix: Referencia corregida de 'user' a 'sessionUser'
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