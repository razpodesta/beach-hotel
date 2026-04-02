/**
 * @file ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Refactorizado: Prevención de Contaminación Cross-Tenant (ClearSession),
 *              soporte para Mutaciones Parciales (Protocolo 33 XP Sync) y 
 *              estabilización del motor de persistencia forense.
 * @version 11.0 - Cross-Tenant Safe & Progressive Mutation
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

/**
 * IMPORTACIONES DE CONTRATO
 * @pilar_V: Alineación con el Centinela de Borde.
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
  /** Preparado para el Protocolo 33: XP en memoria caché */
  xp?: number; 
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
  
  // --- INFRAESTRUCTURA ---
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
  
  // Mutaciones de Identidad
  setSession: (session: SovereignSession | null) => void;
  updateSession: (updates: Partial<SovereignSession>) => void;
  clearSession: () => void;
}

type UIStore = UIState & UIActions;

/**
 * SOVEREIGN STORAGE ENGINE (Resilience Fallback)
 * @description Garantiza que el servidor de Next.js o los navegadores estrictos
 *              no crasheen al intentar acceder a Storage.
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
  // Visibilidad Inicial
  isVisitorHudOpen: true,
  isMobileMenuOpen: false,
  isNewsletterModalOpen: false,
  isAuthModalOpen: false,
  
  // Infraestructura
  hasHydrated: false,
  tenantId: null,
  session: null,

  // Mutaciones
  setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
  setTenant: (tenantId: string | null) => set({ tenantId }),

  setSession: (session: SovereignSession | null) => {
    console.log(`[HEIMDALL][SESSION] Identity Synced: ${session?.role || 'anonymous'}`);
    set({ session });
  },

  /**
   * @action updateSession
   * @description Permite mutar atributos específicos (ej: sumar XP) sin destruir
   *              o re-fetchear la sesión completa. Crucial para gamificación.
   */
  updateSession: (updates: Partial<SovereignSession>) => set((state) => ({
    session: state.session ? { ...state.session, ...updates } : null
  })),

  /**
   * @action clearSession
   * @description Purgado Scorched-Earth. Limpia la sesión Y el perímetro del Tenant
   *              para prevenir contaminación de datos cruzados (Cross-Tenant Leakage).
   */
  clearSession: () => {
    console.log(`[HEIMDALL][SESSION] Connection severed. Purging Identity & Tenant.`);
    set({ session: null, tenantId: null, isAuthModalOpen: false });
  },

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
      // Mantenemos solo lo estrictamente necesario entre recargas
      partialize: (state: UIStore) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
        session: state.session,
      }),
      // Guardián de Hidratación (Pilar VIII)
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[HEIMDALL][STORE] Hydration Sync Error:', error);
        state?.setHasHydrated(true);
      },
      version: 8, // Incrementada para invalidar cachés obsoletas y forzar la nueva estructura
    }
  )
);