/**
 * @file Providers.tsx
 * @description Orquestador Soberano de Infraestructura de UI. 
 *              Implementa el Protocolo "Day-First" con persistencia de atmósfera,
 *              inyección vía data-attributes, blindaje de hidratación React 19,
 *              y el Nuevo Guardián de Identidad (Supabase Sync).
 *              Nivelado: Integración de SovereignRoleType y Protocolo 33 (XP/Level).
 * @version 6.1 - Sovereign Identity & P33 Sync Edition
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useCallback, useSyncExternalStore, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA
 * @pilar_V: Adherencia arquitectónica.
 */
import { supabase } from '../../lib/supabase/client';
import { useUIStore } from '../../lib/store/ui.store';

/**
 * IMPORTACIONES DE CONTRATO (Pure Types)
 * @pilar III: Resolución de TS2305 extrayendo el tipo desde el SSoT del CMS.
 */
import type { SovereignRoleType } from '@metashark/cms-core';

/**
 * @interface ProvidersProps
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @description Evita el "Hydration Mismatch" asegurando sincronía atómica con el DOM.
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
 * SUB-APARATO: IdentityGuard (El Eslabón Perdido)
 * @description Escucha silenciosamente el motor de Supabase y sincroniza la
 *              bóveda de estado global (Zustand) con la realidad criptográfica.
 * @pilar_VIII: Resiliencia - Mantiene la UI congruente entre múltiples pestañas.
 */
function IdentityGuard() {
  const setSession = useUIStore((s) => s.setSession);
  const clearSession = useUIStore((s) => s.clearSession);

  useEffect(() => {
    // 1. Sincronización Inicial (Al montar la app)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({
          userId: session.user.id,
          email: session.user.email ?? '',
          role: (session.user.app_metadata?.role as SovereignRoleType) || 'guest',
          tenantId: (session.user.app_metadata?.tenantId as string) || null,
          lastLogin: new Date().toISOString(),
          // Resolución de TS2345: Inyección de telemetría P33 desde metadata
          xp: Number(session.user.app_metadata?.xp) || 0,
          level: Number(session.user.app_metadata?.level) || 1,
        });
      }
    });

    // 2. Suscripción a la Matriz de Eventos (Real-Time Auth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[HEIMDALL][AUTH] Cryptographic Transition Detected: ${event}`);
      
      if (event === 'SIGNED_OUT' || !session) {
        clearSession();
      } else if (session) {
        setSession({
          userId: session.user.id,
          email: session.user.email ?? '',
          role: (session.user.app_metadata?.role as SovereignRoleType) || 'guest',
          tenantId: (session.user.app_metadata?.tenantId as string) || null,
          lastLogin: new Date().toISOString(),
          // Resolución de TS2345: Inyección de telemetría P33 desde metadata
          xp: Number(session.user.app_metadata?.xp) || 0,
          level: Number(session.user.app_metadata?.level) || 1,
        });
      }
    });

    // Limpieza forense de la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, clearSession]);

  return null; // Componente de infraestructura, no renderiza UI
}

/**
 * APARATO PRINCIPAL: Providers
 * @description Inyecta la inteligencia de atmósfera y estado global en el ecosistema.
 */
export function Providers({ children }: ProvidersProps) {
  const isMounted = useIsMounted();

  /**
   * @pilar_VIII: Resiliencia de Hidratación.
   * Devolvemos un fragmento puro durante SSR para prevenir discrepancias visuales.
   */
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      /**
       * @pilar_VII: Theming Soberano
       * 1. Usamos 'data-theme' para selectores CSS (Tailwind v4 OKLCH).
       * 2. 'defaultTheme="light"' asegura el Modo Día inicial.
       * 3. 'enableSystem={true}' sincroniza con el S.O.
       */
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={true}
      storageKey="beach-hotel-atmosphere"
    >
      {/* El Guardián de Identidad orquesta la sesión en segundo plano */}
      <IdentityGuard />
      
      {children}
    </ThemeProvider>
  );
}