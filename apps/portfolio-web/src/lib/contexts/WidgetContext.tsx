/**
 * @file apps/portfolio-web/src/lib/contexts/WidgetContext.tsx
 * @description Proveedor de estado reactivo para la visibilidad de widgets globales.
 *              Implementa sincronización con LocalStorage mediante suscripción atómica
 *              evitando cascading renders en Next.js 15.
 * @version 3.0 - Reactive Storage Edition (Fix react-hooks/set-state-in-effect)
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { 
  createContext, 
  useContext, 
  useCallback, 
  useSyncExternalStore, 
  type ReactNode 
} from 'react';

/**
 * CONSTANTES DE INFRAESTRUCTURA
 */
const WIDGET_VISIBLE_KEY = 'visitorWidgetVisible';

interface WidgetContextType {
  /** Estado de visibilidad del widget */
  isWidgetVisible: boolean;
  /** Alterna el estado de visibilidad y persiste el cambio */
  toggleWidgetVisibility: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

/**
 * MOTOR DE SUSCRIPCIÓN EXTERNA
 * @pilar X: Rendimiento de Élite. 
 * Permite a React suscribirse a LocalStorage sin usar useEffect/useState.
 */
const storageSnapshot = {
  getSnapshot: () => {
    if (typeof window === 'undefined') return 'true';
    return localStorage.getItem(WIDGET_VISIBLE_KEY) ?? 'true';
  },
  subscribe: (callback: () => void) => {
    window.addEventListener('storage', callback); // Sincronización entre pestañas
    window.addEventListener('widget-sync', callback); // Evento personalizado interno
    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('widget-sync', callback);
    };
  },
  getServerSnapshot: () => 'true' // Fallback para SSR (Pilar VIII)
};

/**
 * APARATO PROVIDER: WidgetProvider
 * @description Orquesta el acceso al estado de los widgets bajo el estándar React 19.
 */
export function WidgetProvider({ children }: { children: ReactNode }) {
  // Suscripción atómica al valor de LocalStorage
  const visibilityValue = useSyncExternalStore(
    storageSnapshot.subscribe,
    storageSnapshot.getSnapshot,
    storageSnapshot.getServerSnapshot
  );

  const isWidgetVisible = visibilityValue === 'true';

  /**
   * ACCIÓN SOBERANA: toggleWidgetVisibility
   * @pilar IV: Trazabilidad. Registra el cambio de estado en el ecosistema.
   */
  const toggleWidgetVisibility = useCallback(() => {
    const newValue = !isWidgetVisible;
    localStorage.setItem(WIDGET_VISIBLE_KEY, String(newValue));
    
    // Disparamos evento interno para que useSyncExternalStore reaccione inmediatamente
    window.dispatchEvent(new Event('widget-sync'));
    
    console.log(`[HEIMDALL][UX] Widget Visibility toggled: ${newValue}`);
  }, [isWidgetVisible]);

  const value = React.useMemo(() => ({
    isWidgetVisible,
    toggleWidgetVisibility
  }), [isWidgetVisible, toggleWidgetVisibility]);

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}

/**
 * HOOK DE CONSUMO: useWidget
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export function useWidget(): WidgetContextType {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('[CRITICAL] useWidget debe ser utilizado dentro de un WidgetProvider.');
  }
  return context;
}