/**
 * @file apps/portfolio-web/src/components/layout/Providers.tsx
 * @description Orquestador de Infraestructura de UI. 
 *              Implementa persistencia de atmósfera (Day-First), inyección vía 
 *              data-attributes y sincronización atómica del pasaporte de identidad.
 *              Nivelado: Telemetría Heimdall v3.0 y Sincronización P33 (XP/Level).
 * 
 * @version 7.0 - MES Compliance & Linter Pure Edition
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useCallback, useSyncExternalStore, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { supabase } from '../../lib/supabase/client';
import { useUIStore } from '../../lib/store/ui.store';

/**
 * IMPORTACIONES DE CONTRATO (Pure Types)
 * @pilar III: Resolución de tipos desde el SSoT del CMS.
 */
import type { SovereignRoleType as AuthorizedRoleType } from '@metashark/cms-core';

/**
 * @interface ProvidersProps
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Hook de Hidratación: useIsMounted
 * @description Asegura sincronía atómica con el DOM para evitar Hydration Mismatch.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => {
      /* No-op: Suscripción estática en cliente */
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => true,  // Browser State
    () => false  // SSR Fallback
  );
}

/**
 * SUB-APARATO: IdentityGuard
 * @description Sincroniza la bóveda de estado global (Zustand) con el motor Supabase.
 */
function IdentityGuard() {
  const setSession = useUIStore((s) => s.setSession);
  const clearSession = useUIStore((s) => s.clearSession);

  useEffect(() => {
    // 1. Sincronización Inicial de Autoridad
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({
          userId: session.user.id,
          email: session.user.email ?? '',
          role: (session.user.app_metadata?.role as AuthorizedRoleType) || 'guest',
          tenantId: (session.user.app_metadata?.tenantId as string) || null,
          lastLogin: new Date().toISOString(),
          // Blindaje contra NaN en metadatos P33
          xp: Number(session.user.app_metadata?.xp || 0),
          level: Number(session.user.app_metadata?.level || 1),
        });
      }
    });

    // 2. Suscripción a la Matriz de Eventos (Real-Time Auth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // @fix: console.info para cumplimiento 'no-console' (ESLint)
      console.info(`\x1b[36m[TELEMETRY][AUTH]\x1b[0m Identity Transition: ${event}`);
      
      if (event === 'SIGNED_OUT' || !session) {
        clearSession();
      } else if (session) {
        setSession({
          userId: session.user.id,
          email: session.user.email ?? '',
          role: (session.user.app_metadata?.role as AuthorizedRoleType) || 'guest',
          tenantId: (session.user.app_metadata?.tenantId as string) || null,
          lastLogin: new Date().toISOString(),
          xp: Number(session.user.app_metadata?.xp || 0),
          level: Number(session.user.app_metadata?.level || 1),
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, clearSession]);

  return null;
}

/**
 * APARATO PRINCIPAL: Providers
 * @description Inyecta la inteligencia de atmósfera y estado global.
 */
export function Providers({ children }: ProvidersProps) {
  const isMounted = useIsMounted();

  /**
   * @pilar VIII: Resiliencia de Hidratación.
   * Retornamos fragmento puro en SSR para evitar discrepancias de árbol.
   */
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      /**
       * @pilar VII: Theming Semántico (Tailwind v4 OKLCH)
       */
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={true}
      storageKey="hotel-beach-atmosphere"
    >
      <IdentityGuard />
      {children}
    </ThemeProvider>
  );
}