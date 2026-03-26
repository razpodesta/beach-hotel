/**
 * @file ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Gestiona la persistencia de preferencias, estados de navegación 
 *              y multi-tenancy mediante una arquitectura reactiva.
 * @version 5.1 - Linter Hygiene Fix (onRehydrateStorage)
 * @author Raz Podestá - MetaShark Tech
 */

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * @interface UIState
 * @description Contrato de datos persistentes y efímeros de la UI.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface UIState {
  /** Estado de visibilidad del panel de telemetría Heimdall */
  isVisitorHudOpen: boolean;
  /** Estado del menú táctil móvil (Takeover mode) */
  isMobileMenuOpen: boolean;
  /** Flag de sincronización tras hidratación de cliente */
  hasHydrated: boolean;
  /** Identificador de propiedad para lógica multi-tenant (Hotel vs Festival) */
  tenantId: string | null;
}

/**
 * @interface UIActions
 * @description Definición de mutaciones atómicas del estado.
 */
interface UIActions {
  toggleVisitorHud: () => void;
  closeVisitorHud: () => void;
  openVisitorHud: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setHasHydrated: (state: boolean) => void;
  setTenant: (tenantId: string) => void;
}

/**
 * SOVEREIGN STORAGE ENGINE
 * @description Motor de respaldo para entornos sin persistencia física (Node.js/SSR).
 * Implementado para cumplir estrictamente con @typescript-eslint/no-unused-vars.
 */
const forensicMockStorage: StateStorage = {
  getItem: (_name: string): string | null => null,
  setItem: (_name: string, _value: string): void => {
    /* No-op: Persistencia deshabilitada en tiempo de compilación/servidor */
  },
  removeItem: (_name: string): void => {
    /* No-op: Operación de limpieza omitida en servidor */
  },
};

/**
 * RESOLVER DE ALMACENAMIENTO SOBERANO
 * @pilar VIII: Resiliencia - Gestiona fallos de acceso a localStorage en navegadores restrictivos.
 */
const resolveStorageEngine = (): StateStorage => {
  if (typeof window === 'undefined') return forensicMockStorage;
  
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn('[HEIMDALL][STORE] LocalStorage inaccesible. Operando en modo memoria volátil.', e);
    return forensicMockStorage;
  }
};

/**
 * STORE: useUIStore
 * @description Fuente única de verdad (SSoT) para el estado visual del ecosistema.
 */
export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      // --- ESTADO INICIAL (Modo Awareness) ---
      isVisitorHudOpen: true,
      isMobileMenuOpen: false,
      hasHydrated: false,
      tenantId: null,

      // --- MUTACIONES DE SINCRONIZACIÓN ---
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      setTenant: (tenantId: string) => set({ tenantId }),

      // --- GESTIÓN DE HUD (Telemetría) ---
      toggleVisitorHud: () => set((state) => ({ isVisitorHudOpen: !state.isVisitorHudOpen })),
      closeVisitorHud: () => set({ isVisitorHudOpen: false }),
      openVisitorHud: () => set({ isVisitorHudOpen: true }),

      // --- GESTIÓN DE NAVEGACIÓN MÓVIL (Interacción Táctica) ---
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'metashark-ui-vault', // Nombre del bucket en el dispositivo del huésped
      storage: createJSONStorage(resolveStorageEngine),
      
      /**
       * @pilar X: Higiene de Persistencia.
       * Filtramos solo las preferencias que impactan en la experiencia a largo plazo.
       * El estado del menú móvil es efímero y se descarta tras recargar.
       */
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
      }),

      /**
       * PROTOCOLO DE HIDRATACIÓN (Pilar VIII)
       * @description Garantiza que el sistema sepa cuándo el estado persistido ha sido 
       * recuperado del disco, evitando parpadeos de interfaz (CLS).
       */
      onRehydrateStorage: (_state) => {
        // CORRECCIÓN: Se añade el prefijo '_' a state para cumplir con el contrato de higiene del linter.
        console.log('[HEIMDALL][STORE] Sincronizando Bóveda de Interfaz...');
        
        return (hydratedState, error) => {
          if (error) {
            console.error('[HEIMDALL][STORE] Fallo crítico de rehidratación:', error);
          } else if (hydratedState) {
            hydratedState.setHasHydrated(true);
            console.log('[HEIMDALL][STORE] UI Vault sincronizada con éxito.');
          }
        };
      },
      
      version: 3, // Evolución a la arquitectura Dual-Mode Staff
    }
  )
);