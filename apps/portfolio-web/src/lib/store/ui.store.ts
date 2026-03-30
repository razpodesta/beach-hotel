/**
 * @file ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Refactorizado: Erradicación de empty-functions (Linter Compliance)
 *              e inyección de telemetría forense en el motor de persistencia.
 * @version 9.1 - Forensic Observability Edition
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
import type { SovereignRole } from '../route-guard';

/**
 * @interface SovereignSession
 * @description Contrato de identidad inyectado tras la validación criptográfica.
 */
export interface SovereignSession {
  userId: string;
  email: string;
  role: SovereignRole;
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
  // Controles de HUD
  toggleVisitorHud: () => void;
  closeVisitorHud: () => void;
  openVisitorHud: () => void;
  
  // Controles de Navegación
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  
  // Controles de Portales
  openNewsletterModal: () => void;
  closeNewsletterModal: () => void;
  toggleAuthModal: () => void;
  closeAuthModal: () => void;
  
  // Acciones de Identidad
  setHasHydrated: (state: boolean) => void;
  setTenant: (tenantId: string | null) => void;
  setSession: (session: SovereignSession | null) => void;
  clearSession: () => void;
}

type UIStore = UIState & UIActions;

/**
 * SOVEREIGN STORAGE ENGINE (Resilience Fallback)
 * @description Motor de respaldo para entornos SSR o almacenamiento bloqueado.
 * @pilar IV & VIII: Observabilidad forense sobre la persistencia.
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

/**
 * RESOLVER DE ALMACENAMIENTO
 */
const resolveStorageEngine = (): StateStorage => {
  if (typeof window === 'undefined') return forensicMockStorage;
  try {
    const testKey = '__metashark_ping__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    console.warn('[HEIMDALL][STORE] LocalStorage inaccesible. Modo volátil activado.');
    return forensicMockStorage;
  }
};

/**
 * CREADOR DE ESTADO
 */
const stateCreator: StateCreator<UIStore, [["zustand/persist", unknown]]> = (set) => ({
  // --- ESTADO INICIAL ---
  isVisitorHudOpen: true,
  isMobileMenuOpen: false,
  isNewsletterModalOpen: false,
  isAuthModalOpen: false,
  hasHydrated: false,
  tenantId: null,
  session: null,

  // --- ACCIONES ---
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
      version: 6,
    }
  )
);