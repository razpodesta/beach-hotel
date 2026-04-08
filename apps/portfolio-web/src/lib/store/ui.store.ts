/**
 * @file apps/portfolio-web/src/lib/store/ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Gestiona la visibilidad de widgets, la persistencia de identidad 
 *              y el motor de reputación reactivo (Protocolo 33).
 *              Refactorizado: Resolución de 'prefer-const', optimización de mutaciones
 *              de sesión e inyección de telemetría Heimdall v3.0.
 * @version 13.0 - Immutable Session Architecture & Linter Pure
 * @author Raz Podestá -  MetaShark Tech
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a fronteras Nx.
 */
import { calculateProgress } from '@metashark/protocol-33';
import type { SovereignRoleType } from '@metashark/cms-core';

/**
 * @interface SovereignSession
 * @description Contrato de identidad inyectado tras la validación criptográfica.
 *              Contiene los claims necesarios para RBAC y Gamificación.
 */
export interface SovereignSession {
  /** Identificador único del usuario (UUID) */
  userId: string;
  /** Correo electrónico vinculado */
  email: string;
  /** Rol de acceso definido en el SSoT de Roles */
  role: SovereignRoleType;
  /** Perímetro de propiedad activo */
  tenantId: string | null;
  /** Marca de tiempo de la última sincronización */
  lastLogin: string;
  /** Puntos de experiencia acumulados (RazTokens) */
  xp: number; 
  /** Nivel de ascensión calculado por el motor P33 */
  level: number;
}

/**
 * @interface UIState
 * @description Contrato inmutable para la bóveda de estado visual.
 */
interface UIState {
  // --- ESTADOS DE VISIBILIDAD ---
  isVisitorHudOpen: boolean;
  isMobileMenuOpen: boolean;
  isNewsletterModalOpen: boolean;
  isAuthModalOpen: boolean;
  
  // --- INFRAESTRUCTRURA ---
  /** Indica si el store ha sido hidratado desde el storage local */
  hasHydrated: boolean;
  /** Tenant ID global de la aplicación (redundancia de seguridad) */
  tenantId: string | null;

  // --- SESIÓN Y RBAC ---
  /** Sesión activa del usuario (null si es Guest/Anónimo) */
  session: SovereignSession | null;
}

/**
 * @interface UIActions
 * @description Mutaciones permitidas sobre el cerebro de la interfaz.
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
  updateSession: (updates: Partial<SovereignSession>) => void;
  clearSession: () => void;
}

type UIStore = UIState & UIActions;

/**
 * SOVEREIGN STORAGE ENGINE (Resilience Fallback)
 * @description Provee un motor de almacenamiento volátil si el entorno no es browser.
 */
const forensicMockStorage: StateStorage = {
  getItem: (): string | null => null,
  setItem: (key: string) => { void key; },
  removeItem: (key: string) => { void key; },
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
const stateCreator: StateCreator<UIStore, [["zustand/persist", unknown]]> = (set, get) => ({
  // Visibilidad Inicial
  isVisitorHudOpen: true,
  isMobileMenuOpen: false,
  isNewsletterModalOpen: false,
  isAuthModalOpen: false,
  
  // Infraestructura
  hasHydrated: false,
  tenantId: null,
  session: null,

  setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
  setTenant: (tenantId: string | null) => set({ tenantId }),

  /**
   * @action setSession
   * @description Sincroniza la identidad tras un handshake exitoso.
   */
  setSession: (session: SovereignSession | null) => {
    if (session) {
      const { currentLevel } = calculateProgress(session.xp || 0);
      session.level = currentLevel;
    }
    console.log(`[HEIMDALL][SESSION] Handshake Complete | Role: ${session?.role || 'anonymous'}`);
    set({ session });
  },

  /**
   * @action updateSession
   * @description Ejecuta una mutación parcial sobre la sesión. 
   *              Si se inyecta XP, recalcula el nivel y emite telemetría de ascensión.
   * @fix: Resolución de prefer-const mediante lógica funcional.
   */
  updateSession: (updates: Partial<SovereignSession>) => {
    const currentSession = get().session;
    if (!currentSession) return;

    // Calculamos el posible nuevo nivel si hay cambio de XP
    const levelUpdate = (typeof updates.xp === 'number') 
      ? { level: calculateProgress(updates.xp).currentLevel } 
      : {};

    const finalUpdates = { ...updates, ...levelUpdate };

    // Telemetría de Ascensión
    if (finalUpdates.level && finalUpdates.level > currentSession.level) {
      console.log(
        `%c[DNA][P33] LEVEL UP | User: ${currentSession.userId} | New Level: ${finalUpdates.level}`, 
        'color: #a855f7; font-weight: bold'
      );
    }

    set({
      session: { ...currentSession, ...finalUpdates }
    });
  },

  /**
   * @action clearSession
   * @description Purgado Scorched-Earth. Erradica identidad y perímetros de memoria.
   */
  clearSession: () => {
    console.warn(`[HEIMDALL][SECURITY] Session Severed. Purging Vault Cache.`);
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
      partialize: (state: UIStore) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
        session: state.session,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[HEIMDALL][STORE] Rehydration Failure:', error);
        state?.setHasHydrated(true);
      },
      version: 10, // Incremento de versión tras refactorización funcional
    }
  )
);