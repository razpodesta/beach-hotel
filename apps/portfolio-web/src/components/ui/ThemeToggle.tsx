// RUTA: apps/portfolio-web/src/components/ui/ThemeToggle.tsx

/**
 * @file Interruptor de Tema (ThemeToggle)
 * @version 4.0 - Performance Elite & React 19 Sync
 * @description Control maestro de tema con detección de hidratación sin parpadeos (flicker-free).
 *              Utiliza `useSyncExternalStore` para sincronización atómica con el DOM.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useSyncExternalStore, useCallback } from 'react';
import { cn } from '../../lib/utils/cn';

/**
 * Hook de hidratación optimizado.
 * Utiliza una función de suscripción nula que cumple con el contrato de `useSyncExternalStore`
 * sin desperdiciar recursos de memoria en listeners innecesarios.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => () => {}, []);
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const isMounted = useIsMounted();
  const { theme, setTheme } = useTheme();

  // Skeleton de élite para prevenir layout shift durante la hidratación
  if (!isMounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full animate-pulse bg-zinc-800/20" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full",
        "text-muted-foreground transition-all duration-300",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon size={18} strokeWidth={1.5} />
        ) : (
          <Sun size={18} strokeWidth={1.5} />
        )}
      </motion.div>
    </button>
  );
}