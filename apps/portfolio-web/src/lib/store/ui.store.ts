/**
 * @file ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Refactorizado: Resolución de contrato EnterpriseRole y 
 *              estabilización del motor de persistencia forense.
 * @version 10.0 - Enterprise Level 4.0 Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

/**
 * IMPORTACIONES DE CONTRATO
 * @pilar V: Alineación con el Centinela de Borde.
 */
import type { EnterpriseRole } from '../route-guard';

/**
 * @interface SovereignSession
 * @description Contrato de identidad inyectado tras la validación criptográfica.
 */
export interface SovereignSession {
  userId: string;
  email: string;
  role: EnterpriseRole;
  tenantId: string | null;
  lastLogin: string;
}

/**
 * @interface UIState
 * @description Contrato inmutable para los datos de la interfaz MetaShark.
 */
interface UIState {
  // --- ESTADOS DE VISIBILIDAD ---
  isVisitorHudOpen: boolean;
  isMobileMenuOpen: boolean;
  isNewsletterModalOpen: boolean;
  isAuthModalOpen: boolean;
  
  // --- INFRAESTRUCTRURA ---
  hasHydrated: boolean;
  tenantId: string | null;

  // --- SESIÓN Y RBAC ---
  /** Sesión activa del usuario (null si es Guest/Anónimo) */
  session: SovereignSession | null;
}

/**
 * @interface UIActions
 * @description Mutaciones permitidas sobre la bóveda de estado.
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
  setSession: (session: SovereignSession | null) => void;
  clearSession: () => void;
}

type UIStore = UIState & UIActions;

/**
 * SOVEREIGN STORAGE ENGINE (Resilience Fallback)
 */
const forensicMockStorage: StateStorage = {
  getItem: (): string | null => null,
  setItem: (key: string) => {
    console.warn(`[HEIMDALL][STORE] Volatile storage set ignored: ${key}`);
  },
  removeItem: (key: string) => {
    console.warn(`[HEIMDALL][STORE] Volatile storage remove ignored: ${key}`);
  },
};

const resolveStorageEngine = (): StateStorage => {
  if (typeof window === 'undefined') return forensicMockStorage;
  try {
    const testKey = '__metashark_ping__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return forensicMockStorage;
  }
};

/**
 * CREADOR DE ESTADO
 */
const stateCreator: StateCreator<UIStore, [["zustand/persist", unknown]]> = (set) => ({
  isVisitorHudOpen: true,
  isMobileMenuOpen: false,
  isNewsletterModalOpen: false,
  isAuthModalOpen: false,
  hasHydrated: false,
  tenantId: null,
  session: null,

  setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
  setTenant: (tenantId: string | null) => set({ tenantId }),

  setSession: (session: SovereignSession | null) => {
    console.log(`[HEIMDALL][SESSION] Identity Synced: ${session?.role || 'anonymous'}`);
    set({ session });
  },
  clearSession: () => set({ session: null, isAuthModalOpen: false }),

  toggleVisitorHud: () => set((s) => ({ isVisitorHudOpen: !s.isVisitorHudOpen })),
  closeVisitorHud: () => set({ isVisitorHudOpen: false }),
  openVisitorHud: () => set({ isVisitorHudOpen: true }),

  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  openNewsletterModal: () => set({ isNewsletterModalOpen: true }),
  closeNewsletterModal: () => set({ isNewsletterModalOpen: false }),
  
  toggleAuthModal: () => set((s) => ({ isAuthModalOpen: !s.isAuthModalOpen })),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
});

export const useUIStore = create<UIStore>()(
  persist(
    stateCreator,
    {
      name: 'metashark-vault-ui',
      storage: createJSONStorage(resolveStorageEngine),
      partialize: (state: UIStore) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
        session: state.session,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[HEIMDALL][STORE] Error en rehidratación:', error);
        state?.setHasHydrated(true);
      },
      version: 7,
    }
  )
);