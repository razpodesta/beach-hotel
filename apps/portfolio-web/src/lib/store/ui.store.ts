/**
 * @file ui.store.ts
 * @description Orquestador Soberano del Estado Global de la Interfaz.
 *              Gestiona la reactividad de componentes, persistencia de atmósfera
 *              y la identidad de sesión para la divulgación progresiva del Portal.
 * @version 9.0 - Sovereign Session Integration & UI Transmutation
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

/**
 * Union Type Soberano para el Store de Zustand.
 */
type UIStore = UIState & UIActions;

/**
 * SOVEREIGN STORAGE ENGINE (Resilience Fallback)
 * @description Motor de respaldo para entornos SSR o almacenamiento bloqueado.
 * @pilar VIII: Resiliencia de Infraestructura.
 */
const forensicMockStorage: StateStorage = {
  getItem: (): string | null => null,
  setItem: (): void => {},
  removeItem: (): void => {},
};

/**
 * RESOLVER DE ALMACENAMIENTO
 * @description Valida el acceso físico a LocalStorage para evitar fallos de hidratación.
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
 * CREADOR DE ESTADO: stateCreator
 * @description Define la lógica pura de mutación y el estado inicial.
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

  // --- ACCIONES: INFRAESTRUCTRURA ---
  setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
  setTenant: (tenantId: string | null) => set({ tenantId }),

  // --- ACCIONES: IDENTIDAD ---
  setSession: (session: SovereignSession | null) => {
    console.log(`[HEIMDALL][SESSION] Identity Synced: ${session?.role || 'anonymous'}`);
    set({ session });
  },
  clearSession: () => set({ session: null, isAuthModalOpen: false }),

  // --- ACCIONES: VISUALES ---
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
 * APARATO: useUIStore
 * @description Fuente Única de Verdad (SSoT) para el estado visual y de sesión.
 */
export const useUIStore = create<UIStore>()(
  persist(
    stateCreator,
    {
      name: 'metashark-vault-ui',
      storage: createJSONStorage(resolveStorageEngine),
      
      /**
       * @pilar X: Higiene de Persistencia.
       * Solo persistimos la visibilidad del HUD y la metadata de sesión
       * para permitir que la UI cargue con el rol correcto sin parpadeos.
       */
      partialize: (state: UIStore) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
        session: state.session, // Habilita persistencia del rol en el Dashboard
      }),

      /**
       * PROTOCOLO DE HIDRATACIÓN
       */
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[HEIMDALL][STORE] Error en rehidratación de bóveda:', error);
          }
          state?.setHasHydrated(true);
        };
      },
      
      version: 6, // Incremental para forzar purga de esquemas antiguos
    }
  )
);