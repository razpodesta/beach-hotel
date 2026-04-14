/**
 * @file apps/portfolio-web/src/lib/store/ui.store.ts
 * @description Orquestador del Estado Global (The DNA Vault).
 *              Gestiona la visibilidad, persistencia de identidad y el 
 *              Reactor de Reputación P33.
 *              Refactorizado: Inyección de Trace IDs en logs de sesión, 
 *              optimización de reactor y cumplimiento estricto de MES.
 * 
 * @version 16.0 - Forensic Logging & P33 Reactor Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { calculateProgress } from '@metashark/reputation-engine';
import type { SovereignRoleType as AuthorizedRoleType } from '@metashark/cms-core';

/**
 * @interface AuthorizedSession
 * @description Contrato de identidad inmutable para el Front-End.
 */
export interface AuthorizedSession {
  userId: string;
  email: string;
  role: AuthorizedRoleType;
  tenantId: string | null;
  lastLogin: string;
  /** RazTokens acumulados */
  xp: number; 
  /** Nivel de ascensión actual */
  level: number;
}

interface UIState {
  // --- ESTADOS DE VISIBILIDAD (Oxygen UI) ---
  isVisitorHudOpen: boolean;
  isMobileMenuOpen: boolean;
  isNewsletterModalOpen: boolean;
  isAuthModalOpen: boolean;
  
  // --- INFRAESTRUCTRURA & PERSISTENCIA ---
  hasHydrated: boolean;
  tenantId: string | null;

  // --- NÚCLEO DE IDENTIDAD ---
  session: AuthorizedSession | null;
}

interface UIActions {
  // Controles de Viewport
  toggleVisitorHud: () => void;
  closeVisitorHud: () => void;
  openVisitorHud: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openNewsletterModal: () => void;
  closeNewsletterModal: () => void;
  toggleAuthModal: () => void;
  closeAuthModal: () => void;
  
  // Sincronización de Sistema
  setHasHydrated: (state: boolean) => void;
  setTenant: (tenantId: string | null) => void;
  
  // Reactor de Identidad y Reputación
  setSession: (session: AuthorizedSession | null) => void;
  updateXP: (gain: number) => void;
  clearSession: () => void;
}

type UIStore = UIState & UIActions;

/**
 * PROTOCOLO CROMÁTICO (Telemetría Heimdall)
 */
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', bold: '\x1b[1m'
} as const;

/**
 * STORAGE ENGINE: Resilience Fallback (Pilar VIII)
 * @description Evita discrepancias de servidor/cliente (Hydration Mismatch).
 */
const resolveStorageEngine = (): StateStorage => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => { /* No-op SSR */ },
      removeItem: () => { /* No-op SSR */ }
    };
  }
  return window.localStorage;
};

/**
 * FACTORÍA DE ESTADO (DNA Creator)
 * @pilar IX: Inversión de Control.
 */
const stateCreator: StateCreator<UIStore, [["zustand/persist", unknown]]> = (set, get) => ({
  // --- VALORES POR DEFECTO (Day-First) ---
  isVisitorHudOpen: true,
  isMobileMenuOpen: false,
  isNewsletterModalOpen: false,
  isAuthModalOpen: false,
  hasHydrated: false,
  tenantId: null,
  session: null,

  setHasHydrated: (state) => set({ hasHydrated: state }),
  setTenant: (tenantId) => set({ tenantId }),

  /**
   * @action setSession
   * @description Handshake de Identidad. Sincroniza el perfil con el motor de niveles.
   */
  setSession: (sessionData) => {
    if (sessionData) {
      const traceId = `vault_link_${Date.now().toString(36).toUpperCase()}`;
      const { currentLevel } = calculateProgress(sessionData.xp || 0);
      const normalizedSession = { ...sessionData, level: currentLevel };
      
      console.info(
        `${C.magenta}${C.bold}● [DNA][VAULT]${C.reset} Identity Linked | ` +
        `Role: ${C.cyan}${normalizedSession.role}${C.reset} | ` +
        `Trace: ${traceId}`
      );
      
      set({ session: normalizedSession });
    } else {
      set({ session: null });
    }
  },

  /**
   * @action updateXP
   * @description Reactor de Reputación (P33 Core).
   */
  updateXP: (gain) => {
    const current = get().session;
    if (!current) return;

    const newXP = current.xp + gain;
    const { currentLevel } = calculateProgress(newXP);

    // Detección Forense de Ascensión
    if (currentLevel > current.level) {
      console.info(
        `%c[P33][ASCENSION] Nivel ${current.level} → ${currentLevel} | RZB Concedidos: +${gain}`, 
        'color: #a855f7; font-weight: bold; padding: 4px; border: 1px solid #a855f7; border-radius: 4px;'
      );
    } else if (process.env.NODE_ENV !== 'production') {
      console.info(`${C.green}[P33][GAIN]${C.reset} +${gain} RazTokens (Total: ${newXP})`);
    }

    set({
      session: {
        ...current,
        xp: newXP,
        level: currentLevel
      }
    });
  },

  /**
   * @action clearSession
   * @description Purga de seguridad de la Bóveda.
   */
  clearSession: () => {
    console.warn(`${C.yellow}[DNA][SECURITY] Access Severed. Purging State Vault.${C.reset}`);
    set({ session: null, isAuthModalOpen: false, isVisitorHudOpen: true });
  },

  // --- CONTROLES DE VISIBILIDAD (Oxygen UI) ---
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

/**
 * @hook useUIStore
 * @description Punto de acceso único al estado soberano.
 */
export const useUIStore = create<UIStore>()(
  persist(
    stateCreator,
    {
      name: 'hotel-beach-vault-v16', // Versión de esquema actualizada
      storage: createJSONStorage(resolveStorageEngine),
      /**
       * @pilar X: Performance (Partialization)
       * Solo persistimos lo que el usuario espera recuperar tras un refresh.
       */
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        session: state.session,
        tenantId: state.tenantId
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (process.env.NODE_ENV !== 'production') {
          console.info(`${C.cyan}[DNA][VAULT]${C.reset} State Rehydrated from Disk.`);
        }
      },
      version: 16, // Alineado con la versión del archivo
    }
  )
);