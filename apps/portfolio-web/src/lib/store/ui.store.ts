/**
 * @file apps/portfolio-web/src/lib/store/ui.store.ts
 * @version 3.3 - Multi-Tenant State Engine
 * @description Store global desacoplado y multi-tenant. 
 *              Implementa MockStorage con parámetros ignorados explícitamente para
 *              cumplir con las reglas de linter más estrictas.
 * @author Raz Podestá - MetaShark Tech
 */

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

interface UIState {
  isVisitorHudOpen: boolean;
  isMobileMenuOpen: boolean;
  hasHydrated: boolean;
  tenantId: string | null;
}

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
 * MockStorage Forense:
 * Implementa las funciones requeridas por StateStorage.
 * Nota: Los parámetros se nombran sin guion bajo y se descartan explícitamente
 * para evitar el error de 'no-unused-vars' y 'no-empty-function'.
 */
const mockStorage: StateStorage = {
  getItem: () => null,
  setItem: (name, value) => {
    // Uso explícito para evitar warnings del linter
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Zustand-SSR-Storage] Intento de escribir ${name}=${value} ignorado.`);
    }
  },
  removeItem: (name) => {
    // Uso explícito del parámetro
    void name; 
  },
};

const getStorage = () => (typeof window !== 'undefined' ? localStorage : mockStorage);

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      // --- Estado Inicial ---
      isVisitorHudOpen: true,
      isMobileMenuOpen: false,
      hasHydrated: false,
      tenantId: null,

      // --- Acciones ---
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setTenant: (tenantId) => set({ tenantId }),

      toggleVisitorHud: () => set((state) => ({ isVisitorHudOpen: !state.isVisitorHudOpen })),
      closeVisitorHud: () => set({ isVisitorHudOpen: false }),
      openVisitorHud: () => set({ isVisitorHudOpen: true }),

      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'portfolio-ui-preferences',
      storage: createJSONStorage(getStorage),
      
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
        tenantId: state.tenantId,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      
      version: 1, 
    }
  )
);