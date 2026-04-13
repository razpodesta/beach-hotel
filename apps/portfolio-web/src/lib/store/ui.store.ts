/**
 * @file apps/portfolio-web/src/lib/store/ui.store.ts
 * @description Orquestador Soberano del Estado Global (The DNA Vault).
 *              Gestiona la visibilidad de widgets, persistencia de identidad 
 *              y el reactor de reputación reactivo (Protocolo 33).
 *              Refactorizado: Resolución de infracciones 'no-empty-function'
 *              mediante No-Op explícitos para entornos SSR.
 * @version 14.1 - Linter Pure & Reputation Reactor Active
 * @author Staff Engineer - MetaShark Tech
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (SSoT)
 * @pilar V: Adherencia Arquitectónica.
 */
import { calculateProgress } from '@metashark/reputation-engine';
import type { SovereignRoleType } from '@metashark/cms-core';

/**
 * @interface SovereignSession
 * @description Contrato de identidad inyectado tras la validación criptográfica.
 */
export interface SovereignSession {
  userId: string;
  email: string;
  role: SovereignRoleType;
  tenantId: string | null;
  lastLogin: string;
  /** Puntos de experiencia (RazTokens) - Sincronizado con Silo D */
  xp: number; 
  /** Nivel de ascensión calculado por el motor P33 */
  level: number;
}

interface UIState {
  // --- ESTADOS DE VISIBILIDAD ---
  isVisitorHudOpen: boolean;
  isMobileMenuOpen: boolean;
  isNewsletterModalOpen: boolean;
  isAuthModalOpen: boolean;
  
  // --- INFRAESTRUCTRURA ---
  hasHydrated: boolean;
  tenantId: string | null;

  // --- SESIÓN Y REPUTACIÓN ---
  session: SovereignSession | null;
}

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
  
  /** Acciones de Identidad */
  setSession: (session: SovereignSession | null) => void;
  updateXP: (gain: number) => void;
  clearSession: () => void;
}

type UIStore = UIState & UIActions;

/**
 * PROTOCOLO CROMÁTICO HEIMDALL v3.0
 */
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', bold: '\x1b[1m'
};

/**
 * STORAGE ENGINE: Resilience Fallback
 * @description Provee una implementación No-Op para entornos de servidor (SSR).
 * @fix: Se añaden comentarios internos para satisfacer la regla 'no-empty-function'.
 */
const resolveStorageEngine = (): StateStorage => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => { 
        /* Handshake de escritura omitido en servidor */ 
      },
      removeItem: () => { 
        /* Handshake de purga omitido en servidor */ 
      }
    };
  }
  return window.localStorage;
};

/**
 * FACTORÍA DE ESTADO (DNA Creator)
 */
const stateCreator: StateCreator<UIStore, [["zustand/persist", unknown]]> = (set, get) => ({
  // Estados Iniciales
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
   * @description Handshake final de identidad. Calcula el rango inicial.
   */
  setSession: (sessionData) => {
    if (sessionData) {
      const { currentLevel } = calculateProgress(sessionData.xp || 0);
      const normalizedSession = { ...sessionData, level: currentLevel };
      
      console.log(
        `${C.magenta}${C.bold}[DNA][SESSION]${C.reset} Identity Linked | ` +
        `Role: ${C.cyan}${normalizedSession.role}${C.reset} | ` +
        `XP: ${C.green}${normalizedSession.xp}${C.reset}`
      );
      
      set({ session: normalizedSession });
    } else {
      set({ session: null });
    }
  },

  /**
   * @action updateXP
   * @description Reactor de Reputación. Inyecta XP y dispara telemetría de ascensión.
   * @pilar III: Inmutabilidad Total.
   */
  updateXP: (gain) => {
    const current = get().session;
    if (!current) return;

    const newXP = current.xp + gain;
    const { currentLevel } = calculateProgress(newXP);

    // Detección de Ascensión (Level Up)
    if (currentLevel > current.level) {
      console.log(
        `%c[P33][ASCENSION] Nivel ${current.level} → ${currentLevel} | RZB Delta: +${gain}`, 
        'color: #a855f7; font-weight: bold; font-size: 12px;'
      );
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
   * @description Protocolo Scorched-Earth para cierre de sesión.
   */
  clearSession: () => {
    console.warn(`${C.yellow}[HEIMDALL][SECURITY] Session Severed. Purging Vault.${C.reset}`);
    set({ session: null, isAuthModalOpen: false });
  },

  // Controles de Visibilidad
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
 * @description Único punto de acceso al estado reactivo y persistente del ecosistema.
 */
export const useUIStore = create<UIStore>()(
  persist(
    stateCreator,
    {
      name: 'metashark-vault-ui',
      storage: createJSONStorage(resolveStorageEngine),
      /**
       * @pilar XIII: Privacy & Build Isolation.
       * Solo persistimos los datos necesarios para la continuidad de la atmósfera.
       */
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      version: 11, // Sincronizado con el Reactor P33 v2.0
    }
  )
);