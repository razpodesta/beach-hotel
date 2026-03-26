/**
 * @file apps/portfolio-web/src/lib/store/ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Gestiona la persistencia de preferencias, estados de navegación 
 *              y multi-tenancy mediante una arquitectura reactiva.
 *              Nivelado para 'verbatimModuleSyntax' y resiliencia de hidratación.
 * @version 6.0 - Sovereign Hydration & Type Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

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
  /** Flag de sincronización tras hidratación de cliente (Anti-CLS) */
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
  setTenant: (tenantId: string | null) => void;
}

/**
 * SOVEREIGN STORAGE ENGINE (MOCK)
 * @description Motor de respaldo para entornos sin persistencia física (Node.js/SSR).
 * Garantiza que la aplicación no colapse durante el renderizado en servidor.
 */
const forensicMockStorage: StateStorage = {
  getItem: (_name: string): string | null => null,
  setItem: (_name: string, _value: string): void => {
    /* No-op: Persistencia deshabilitada en tiempo de compilación o servidor */
  },
  removeItem: (_name: string): void => {
    /* No-op: Operación de limpieza omitida en entorno no-browser */
  },
};

/**
 * RESOLVER DE ALMACENAMIENTO SOBERANO
 * @pilar VIII: Resiliencia - Gestiona fallos de acceso a localStorage.
 */
const resolveStorageEngine = (): StateStorage => {
  if (typeof window === 'undefined') return forensicMockStorage;
  
  try {
    const testKey = '__metashark_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn('[HEIMDALL][STORE] LocalStorage inaccesible o restringido. Modo volátil activo.', e);
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
      // --- ESTADO INICIAL ---
      isVisitorHudOpen: true,
      isMobileMenuOpen: false,
      hasHydrated: false,
      tenantId: null,

      // --- MUTACIONES DE SINCRONIZACIÓN ---
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      setTenant: (tenantId: string | null) => set({ tenantId }),

      // --- GESTIÓN DE HUD (Telemetría) ---
      toggleVisitorHud: () => set((state) => ({ isVisitorHudOpen: !state.isVisitorHudOpen })),
      closeVisitorHud: () => set({ isVisitorHudOpen: false }),
      openVisitorHud: () => set({ isVisitorHudOpen: true }),

      // --- GESTIÓN DE NAVEGACIÓN MÓVIL (Interacción Táctica) ---
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'metashark-ui-vault',
      storage: createJSONStorage(resolveStorageEngine),
      
      /**
       * @pilar X: Higiene de Persistencia.
       * Excluimos estados efímeros (menús abiertos) para evitar comportamientos
       * inesperados al recargar la página.
       */
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
      }),

      /**
       * PROTOCOLO DE HIDRATACIÓN (Pilar VIII)
       * @description Sincroniza el estado persistido con el DOM.
       */
      onRehydrateStorage: () => {
        console.log('[HEIMDALL][STORE] Iniciando sincronización de bóveda UI...');
        
        return (state, error) => {
          if (error) {
            console.error('[HEIMDALL][STORE] Fallo en recuperación de persistencia:', error);
          }
          // Marcamos como hidratado independientemente del error para liberar el renderizado
          state?.setHasHydrated(true);
          console.log('[HEIMDALL][STORE] Sincronización completada.');
        };
      },
      
      version: 4, // Incremento de versión por refactorización de tipos
    }
  )
);