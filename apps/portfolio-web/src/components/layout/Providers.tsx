/**
 * @file Providers.tsx
 * @description Orquestador Soberano de Infraestructura de UI. 
 *              Implementa el Protocolo "Day-First" con persistencia de atmósfera,
 *              inyección vía data-attributes y blindaje de hidratación React 19.
 * @version 5.0 - Sovereign Day-First Edition
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * @interface ProvidersProps
 * @description Contrato de propiedades para el orquestador de contextos.
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @description Utiliza la suscripción atómica al DOM para garantizar que el
 *              cliente está totalmente sincronizado antes de renderizar lógica de tema.
 */
function useIsMounted(): boolean {
  /**
   * @pilar X: Higiene de Código.
   * La función de suscripción es terminal y estática en el cliente.
   */
  const subscribe = useCallback(() => {
    return () => {
      /* No-op: El ciclo de vida de montaje no requiere des-suscripción activa */
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,  // Browser State
    () => false  // SSR Fallback
  );
}

/**
 * APARATO: Providers
 * @description Inyecta la inteligencia de atmósfera y estado global en el ecosistema.
 */
export function Providers({ children }: ProvidersProps) {
  const isMounted = useIsMounted();

  /**
   * @pilar VIII: Resiliencia de Hidratación.
   * Devolvemos un fragmento puro durante SSR para prevenir el error de
   * discrepancia entre el servidor y el cliente (Hydration Mismatch).
   */
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      /**
       * @pilar VII: Theming Soberano
       * 1. Usamos 'data-theme' para permitir selectores CSS más potentes y escalables.
       * 2. 'defaultTheme="light"' asegura que el hotel reciba al huésped con luz.
       * 3. 'enableSystem={true}' permite al usuario volver a sincronizar con su SO.
       * 4. 'storageKey' personalizado para asegurar la persistencia en el dominio.
       */
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={true}
      storageKey="beach-hotel-atmosphere"
    >
      {children}
    </ThemeProvider>
  );
}