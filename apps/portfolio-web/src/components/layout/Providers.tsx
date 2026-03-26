/**
 * @file Providers.tsx
 * @description Orquestador Soberano de Proveedores Globales. 
 *              Implementa resiliencia de hidratación mediante suscripción atómica
 *              al DOM, garantizando paridad de temas y estado en React 19.
 * @version 4.1 - Linter Hygiene & React 19 Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * @interface ProvidersProps
 * @description Contrato de propiedades para el inyector de contextos.
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @description Utiliza useSyncExternalStore para detectar el montaje en el cliente 
 *              de forma determinista. Este patrón es la solución de grado Staff 
 *              para erradicar Hydration Mismatches y errores de contexto nulo.
 */
function useIsMounted(): boolean {
  /**
   * @pilar X: Higiene de Código.
   * Definición de limpieza estática para cumplir con @typescript-eslint/no-empty-function.
   */
  const subscribe = useCallback(() => {
    const noop = () => {
      /* No-op: El estado de montaje es terminal y no requiere des-suscripción activa */
    };
    return noop;
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,  // Estado en Cliente (Browser)
    () => false  // Estado en Servidor (SSR)
  );
}

/**
 * APARATO: Providers
 * @description Envuelve la aplicación en los contextos necesarios para la 
 *              experiencia de usuario (Theming, UI State).
 */
export function Providers({ children }: ProvidersProps) {
  const isMounted = useIsMounted();

  /**
   * @pilar VIII: Resiliencia de Hidratación.
   * Durante el renderizado en servidor o la fase de pre-hidratación, 
   * devolvemos un fragmento puro para evitar que el 'ThemeProvider' 
   * intente acceder al 'document' antes de tiempo.
   */
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={true}
    >
      {children}
    </ThemeProvider>
  );
}