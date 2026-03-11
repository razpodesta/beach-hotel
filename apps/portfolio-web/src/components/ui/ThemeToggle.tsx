/**
 * @file apps/portfolio-web/src/components/ui/ThemeToggle.tsx
 * @description Control soberano de alternancia de tema (Claro/Oscuro). 
 *              Implementa detección de hidratación de alta fidelidad para evitar 
 *              parpadeos de layout (CLS) y animaciones físicas con Framer Motion.
 * @version 5.0
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useSyncExternalStore, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IMPORTACIONES NIVELADAS (Rutas relativas para cumplimiento Nx)
 */
import { cn } from '../../lib/utils/cn';

/**
 * Hook de hidratación de élite.
 * Utiliza useSyncExternalStore para una sincronización atómica con el DOM,
 * garantizando que el componente sepa exactamente cuándo está montado en el cliente.
 */
function useIsMounted(): boolean {
  /**
   * CORRECCIÓN ESLINT: Se define una función de limpieza explícita 
   * para evitar el error de "función flecha vacía".
   */
  const subscribe = useCallback(() => {
    const unsubscribe = () => {
      // No-op: Suscripción estática al ciclo de montaje
    };
    return unsubscribe;
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

/**
 * Aparato de UI: ThemeToggle
 * @returns {JSX.Element} Un botón interactivo con feedback visual inmersivo.
 */
export function ThemeToggle() {
  const isMounted = useIsMounted();
  const { theme, setTheme } = useTheme();

  /**
   * Skeleton de seguridad: Durante la hidratación (SSR/Pre-mount), 
   * renderizamos un placeholder del mismo tamaño para evitar saltos visuales.
   */
  if (!isMounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/20 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
        "bg-muted/50 border border-border hover:bg-accent hover:border-primary/30",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      )}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Activar Luz' : 'Activar Oscuridad'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon size={18} strokeWidth={1.5} className="text-primary" />
          ) : (
            <Sun size={18} strokeWidth={1.5} className="text-yellow-500" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}