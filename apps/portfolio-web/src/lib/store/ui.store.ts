// RUTA: apps/portfolio-web/src/lib/store/ui.store.ts
// VERSIÓN: 2.0 - Hidratación Atómica & Contrato Separado
// DESCRIPCIÓN: Store global para UI con persistencia controlada y estado de hidratación
//              para prevenir Hydration Mismatch en Next.js 15.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  isVisitorHudOpen: boolean;
  isMobileMenuOpen: boolean;
  hasHydrated: boolean; // Estado para control de hidratación
}

interface UIActions {
  toggleVisitorHud: () => void;
  closeVisitorHud: () => void;
  openVisitorHud: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      // --- Estado Inicial ---
      isVisitorHudOpen: true,
      isMobileMenuOpen: false,
      hasHydrated: false,

      // --- Acciones ---
      setHasHydrated: (state) => set({ hasHydrated: state }),
      
      toggleVisitorHud: () =>
        set((state) => ({ isVisitorHudOpen: !state.isVisitorHudOpen })),
      closeVisitorHud: () => set({ isVisitorHudOpen: false }),
      openVisitorHud: () => set({ isVisitorHudOpen: true }),

      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'portfolio-ui-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isVisitorHudOpen: state.isVisitorHudOpen,
      }),
      // Middleware de hidratación
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);