/**
 * @file ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Gestiona la persistencia de preferencias, estados de navegación 
 *              y multi-tenancy. Implementa un motor de almacenamiento resiliente 
 *              al renderizado de servidor (SSR).
 * @version 4.0 - Elite Production Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * @interface UIState
 * @description Contrato de datos persistentes y efímeros de la UI.
 */
interface UIState {
  /** Estado de visibilidad del panel Heimdall */
  isVisitorHudOpen: boolean;
  /** Estado del menú táctil móvil */
  isMobileMenuOpen: boolean;
  /** Flag de sincronización tras hidratación de cliente */
  hasHydrated: boolean;
  /** Identificador de propiedad para lógica multi-tenant */
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
    /* No-op: Persistencia deshabilitada en tiempo de compilación */
  },
  removeItem: (_name: string): void => {
    /* No-op: Operación de limpieza omitida en servidor */
  },
};

/**
 * @description Resuelve el motor de almacenamiento basado en el entorno de ejecución.
 */
const resolveStorageEngine = () => 
  (typeof window !== 'undefined' ? localStorage : forensicMockStorage);

/**
 * STORE: useUIStore
 * @description Fuente única de verdad para el estado visual del ecosistema.
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
      setTenant: (tenantId: string) => set({ tenantId }),

      // --- GESTIÓN DE HUD (TELEMETRÍA) ---
      toggleVisitorHud: () => set((state) => ({ isVisitorHudOpen: !state.isVisitorHudOpen })),
      closeVisitorHud: () => set({ isVisitorHudOpen: false }),
      openVisitorHud: () => set({ isVisitorHudOpen: true }),

      // --- GESTIÓN DE NAVEGACIÓN MÓVIL ---
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'sanctuary-ui-vault', // Nombre del bucket en LocalStorage
      storage: createJSONStorage(resolveStorageEngine),
      
      /**
       * @pilar X: Higiene de Persistencia.
       * Solo persistimos preferencias que el usuario desea recordar. 
       * Los menús abiertos y flags de hidratación se resetean en cada carga.
       */
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
      }),

      /**
       * PROTOCOLO DE HIDRATACIÓN
       * @description Asegura que los componentes de cliente sepan cuándo es seguro
       * acceder al estado persistido.
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          console.log('[HEIMDALL][STORE] UI Vault rehydrated and synchronized.');
        }
      },
      
      version: 2, // Migración de versión para limpiar stores antiguos del proyecto base
    }
  )
);