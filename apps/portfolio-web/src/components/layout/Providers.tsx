/**
 * @file apps/portfolio-web/src/components/layout/Providers.tsx
 * @description Proveedor de estado global para el ecosistema.
 *              Implementa resiliencia de hidratación mediante useSyncExternalStore
 *              para evitar colisiones de contexto sin efectos secundarios (cascading renders).
 * @version 3.2 - React 19 Hydration Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useCallback, useSyncExternalStore } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * Hook de Hidratación de Élite:
 * Detecta si el componente está montado en el cliente sin disparar efectos secundarios.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    const noopUnsubscribe = () => { /* No-op: Estado estático en cliente */ };
    return noopUnsubscribe;
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,  // Valor en Cliente
    () => false  // Valor en Servidor (SSR)
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const isMounted = useIsMounted();

  // Durante SSR, renderizamos sin ThemeProvider para evitar "Flash of Unstyled Content"
  // y errores de contexto nulo. Una vez hidratado, el provider toma el control.
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}