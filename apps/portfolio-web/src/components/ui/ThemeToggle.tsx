/**
 * @file ThemeToggle.tsx
 * @description Aparato de control de atmósfera soberano. 
 *              Implementa un ciclo triple (Luz/Noche/Sistema) con persistencia,
 *              animaciones físicas de alta fidelidad y cumplimiento i18n total.
 * @version 6.0 - Sovereign Triad Cycle Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useSyncExternalStore, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 */
import { cn } from '../../lib/utils/cn';

/**
 * @interface ThemeToggleProps
 * @description Contrato de propiedades inyectado por el orquestador i18n.
 */
interface ThemeToggleProps {
  dictionary: {
    label_toggle: string;
    mode_light: string;
    mode_dark: string;
    mode_system: string;
  };
  className?: string;
}

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @description Garantiza sincronía atómica con el DOM para evitar Hydration Mismatches.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => { /* No-op: Suscripción estática */ };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

/**
 * APARATO: ThemeToggle
 * @description Controlador táctico de la identidad lumínica del ecosistema.
 */
export function ThemeToggle({ dictionary, className }: ThemeToggleProps) {
  const isMounted = useIsMounted();
  const { theme, setTheme } = useTheme();

  /**
   * ACCIÓN SOBERANA: handleCycleTheme
   * @description Orquesta el ciclo de atmósfera: Light -> Dark -> System.
   * @pilar IV: Implementa trazabilidad Heimdall.
   */
  const handleCycleTheme = useCallback(() => {
    let nextTheme: 'light' | 'dark' | 'system';

    switch (theme) {
      case 'light': nextTheme = 'dark'; break;
      case 'dark': nextTheme = 'system'; break;
      default: nextTheme = 'light';
    }

    console.group(`[HEIMDALL][UX] Atmosphere Transition`);
    console.log(`From: ${theme} -> To: ${nextTheme}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.groupEnd();

    setTheme(nextTheme);
  }, [theme, setTheme]);

  /**
   * RESOLUCIÓN VISUAL: activeState
   * @description Determina el icono y la etiqueta según el estado activo.
   */
  const activeState = useMemo(() => {
    if (theme === 'dark') return { Icon: Moon, label: dictionary.mode_dark, color: 'text-primary' };
    if (theme === 'light') return { Icon: Sun, label: dictionary.mode_light, color: 'text-yellow-500' };
    return { Icon: Monitor, label: dictionary.mode_system, color: 'text-zinc-400' };
  }, [theme, dictionary]);

  /**
   * SKELETON DE SEGURIDAD (Pilar VIII)
   */
  if (!isMounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/50 animate-pulse border border-border" />
    );
  }

  return (
    <button
      onClick={handleCycleTheme}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500",
        "bg-surface border border-border hover:border-primary/30 group",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
      aria-label={`${dictionary.label_toggle}: ${activeState.label}`}
      title={`${dictionary.label_toggle}: ${activeState.label}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, scale: 0.5, rotate: -45, y: 10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 45, y: -10 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.3 
          }}
          className={cn("flex items-center justify-center", activeState.color)}
        >
          <activeState.Icon size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
        </motion.div>
      </AnimatePresence>

      {/* Efecto de resplandor ambiental sutil (MEA/UX) */}
      <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 blur-md transition-opacity pointer-events-none" />
    </button>
  );
}