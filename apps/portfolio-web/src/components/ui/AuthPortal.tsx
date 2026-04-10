/**
 * @file apps/portfolio-web/src/components/ui/AuthPortal.tsx
 * @description Host Wrapper para el Identity Gateway (The Access Shield).
 *              Actúa como el puente de orquestación entre la librería autónoma
 *              y el ecosistema local (Zustand + Bridge Sync).
 *              Refactorizado: Inyección de continuidad de navegación (nextPath),
 *              optimización de sincronía de sesión y trazabilidad forense.
 * @version 3.0 - Navigation Continuity & Session Hardened
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

/**
 * IMPORTACIONES DE LIBRERÍA SOBERANA
 * @pilar IX: Inversión de Control. Consumimos la fachada de identidad.
 */
import { AuthModal, type IdentityUser } from '@metashark/identity-gateway';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA LOCAL (Fronteras Nx)
 */
import { useUIStore } from '../../lib/store/ui.store';
import { syncIdentityAction } from '../../lib/portal/actions/auth-sync.actions';
import { i18n, isValidLocale, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

interface AuthPortalProps {
  /** Diccionario local validado por MACS */
  dictionary: Dictionary['auth_portal'];
}

/**
 * APARATO: AuthPortal (Host Orchestrator)
 * @description Conecta el estado global de la UI con la pasarela de identidad.
 */
export function AuthPortal({ dictionary }: AuthPortalProps) {
  const pathname = usePathname();
  
  // 1. CONEXIÓN AL ESTADO GLOBAL (Bóveda Zustand)
  const { isAuthModalOpen, closeAuthModal } = useUIStore();

  /**
   * 2. RESOLUCIÓN DE CONTEXTO GEOGRÁFICO (Type-Safe)
   * @description Determina el idioma para el modal basándose en la ruta activa.
   */
  const currentLang = useMemo(() => {
    const segment = pathname?.split('/')[1];
    return segment && isValidLocale(segment) ? (segment as Locale) : i18n.defaultLocale;
  }, [pathname]);

  /**
   * HANDLER: handleAuthSuccess (Credential-based flow)
   * @description Se dispara cuando el usuario inicia sesión mediante Email/Password.
   *              Realiza el Bridge Handshake con el núcleo del hotel.
   */
  const handleAuthSuccess = useCallback(async (user: IdentityUser) => {
    const traceId = `hsk_bridge_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();
    
    console.group(`${C.magenta}${C.bold}[HEIMDALL][AUTH]${C.reset} Bridge Handshake: ${C.cyan}${traceId}${C.reset}`);
    console.log(`Identity_Node: ${user.email} | Origin: ${pathname}`);

    try {
      /**
       * @step Normalización de Identidad
       * Extraemos el nombre real desde los metadatos de Supabase.
       */
      const rawMetadata = user.user_metadata || {};
      const identityName = 
        (rawMetadata.full_name as string) || 
        (rawMetadata.name as string) || 
        user.email.split('@')[0];

      /**
       * @step CMS Identity Sync
       * Vinculamos la identidad verificada con la colección 'users' de Payload.
       */
      const result = await syncIdentityAction({
        id: user.id,
        email: user.email,
        name: identityName
      });

      const duration = (performance.now() - startTime).toFixed(4);

      if (result.success) {
        console.log(`   ${C.green}✓ [GRANTED]${C.reset} CMS Sync successful | Latency: ${duration}ms`);
        
        // Protocolo de Cierre de Bóveda
        closeAuthModal();
        
        /** 
         * @pilar VIII: Resiliencia de Sesión
         * Refrescamos el árbol de componentes para que el servidor reconozca 
         * las nuevas cookies de autenticación en la siguiente navegación.
         */
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        console.error(`   ${C.red}✕ [BREACH]${C.reset} Identity Bridge failure: ${result.error}`);
        throw new Error(result.error || 'SYNC_DRIFT');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'UNEXPECTED_CORE_DRIFT';
      console.error(`   ${C.red}✕ [CRITICAL]${C.reset} Bridge handshake aborted: ${msg}`);
      throw err; // Propagamos al modal para feedback visual en UI
    } finally {
      console.groupEnd();
    }
  }, [closeAuthModal, pathname]);

  /**
   * @pilar VIII: Resiliencia de Render.
   */
  if (!dictionary) return null;

  return (
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={closeAuthModal}
      onSuccess={handleAuthSuccess}
      locale={currentLang}
      /**
       * @pilar XII: Continuidad MEA/UX.
       * Inyectamos la ruta actual para que los proveedores de OAuth (Google)
       * sepan exactamente a dónde devolver al huésped tras la validación.
       */
      nextPath={pathname}
      /**
       * @pilar IX: Inversión de Control.
       * Sobrescribimos el diccionario genérico con el SSoT del hotel.
       */
      dictionaryOverrides={dictionary}
    />
  );
}