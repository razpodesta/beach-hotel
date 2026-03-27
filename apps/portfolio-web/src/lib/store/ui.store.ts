/**
 * @file ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Refactorizado: Resolución de errores de inferencia de tipos y 
 *              limpieza de métodos vacíos para cumplimiento de linter.
 * @version 8.0 - Absolute Type Integrity & Lint Clean
 * @author Raz Podestá - MetaShark Tech
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

/**
 * @interface UIState
 * @description Contrato inmutable para los datos de la interfaz.
 */
interface UIState {
  isVisitorHudOpen: boolean;
  isMobileMenuOpen: boolean;
  isNewsletterModalOpen: boolean;
  isAuthModalOpen: boolean;
  hasHydrated: boolean;
  tenantId: string | null;
}

/**
 * @interface UIActions
 * @description Contrato para las mutaciones del estado.
 */
interface UIActions {
  toggleVisitorHud: () => void;
  closeVisitorHud: () => void;
  openVisitorHud: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openNewsletterModal: () => void;
  closeNewsletterModal: () => void;
  toggleAuthModal: () => void;
  closeAuthModal: () => void;
  setHasHydrated: (state: boolean) => void;
  setTenant: (tenantId: string | null) => void;
}

/**
 * Union Type Soberano para el Store.
 */
type UIStore = UIState & UIActions;

/**
 * SOVEREIGN STORAGE ENGINE (Emergency Fallback)
 * @description Motor de respaldo para entornos sin persistencia física (Node.js/SSR).
 */
const forensicMockStorage: StateStorage = {
  getItem: (): string | null => null,
  setItem: (): void => {
    /* No-op: Persistencia deshabilitada durante la fase de servidor/build */
  },
  removeItem: (): void => {
    /* No-op: Limpieza de storage omitida en entorno no-browser */
  },
};

/**
 * RESOLVER DE ALMACENAMIENTO SOBERANO
 * @pilar VIII: Resiliencia - Manejo de fallos en I/O de LocalStorage.
 */
const resolveStorageEngine = (): StateStorage => {
  if (typeof window === 'undefined') return forensicMockStorage;
  try {
    const testKey = '__metashark_vault_ping__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    console.warn('[HEIMDALL][STORE] LocalStorage inaccesible. Operando en modo volátil.');
    return forensicMockStorage;
  }
};

/**
 * CREADOR DE ESTADO: stateCreator
 * @pilar III: Seguridad de Tipos. Definición explícita para asegurar la inferencia en 'persist'.
 */
const stateCreator: StateCreator<UIStore, [["zustand/persist", unknown]]> = (set) => ({
  // --- ESTADO INICIAL ---
  isVisitorHudOpen: true,
  isMobileMenuOpen: false,
  isNewsletterModalOpen: false,
  isAuthModalOpen: false,
  hasHydrated: false,
  tenantId: null,

  // --- ACCIONES: INFRAESTRUCTRURA ---
  setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
  setTenant: (tenantId: string | null) => set({ tenantId }),

  // --- ACCIONES: HEIMDALL HUD ---
  toggleVisitorHud: () => set((s) => ({ isVisitorHudOpen: !s.isVisitorHudOpen })),
  closeVisitorHud: () => set({ isVisitorHudOpen: false }),
  openVisitorHud: () => set({ isVisitorHudOpen: true }),

  // --- ACCIONES: NAVEGACIÓN ---
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // --- ACCIONES: PORTALES ---
  openNewsletterModal: () => set({ isNewsletterModalOpen: true }),
  closeNewsletterModal: () => set({ isNewsletterModalOpen: false }),
  
  toggleAuthModal: () => set((s) => ({ isAuthModalOpen: !s.isAuthModalOpen })),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
});

/**
 * APARATO: useUIStore
 * @description Fuente única de verdad (SSoT) para el estado visual MetaShark.
 */
export const useUIStore = create<UIStore>()(
  persist(
    stateCreator,
    {
      name: 'metashark-ui-vault',
      storage: createJSONStorage(resolveStorageEngine),
      
      /**
       * @pilar X: Higiene de Persistencia.
       */
      partialize: (state: UIStore) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
      }),

      /**
       * PROTOCOLO DE HIDRATACIÓN (Pilar VIII)
       * @description Sincroniza el estado y libera el renderizado del cliente.
       */
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[HEIMDALL][STORE] Fallo en la recuperación de estado:', error);
          }
          // El estado aquí ya está correctamente tipado como UIStore | undefined
          state?.setHasHydrated(true);
        };
      },
      
      version: 5,
    }
  )
);