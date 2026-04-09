/**
 * @file apps/portfolio-web/src/components/ui/AuthPortal.tsx
 * @description Host Wrapper para el Identity Gateway (The Access Shield).
 *              Actúa como el puente de orquestación entre la librería autónoma
 *              y el ecosistema local (Zustand + Bridge Sync).
 *              Refactorizado: Gestión de errores de sincronización, optimización 
 *              de recarga de sesión (SSR-Safe) y validación de metadatos estricta.
 *              Estándar: Heimdall v2.5 Forensic Logging & React 19 Purity.
 * @version 2.0 - Forensic Handshake & Session Resilience
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

/**
 * IMPORTACIONES DE LIBRERÍA SOBERANA
 * @pilar IX: Desacoplamiento. Consumimos la fachada limpia.
 */
import { AuthModal, type IdentityUser } from '@metashark/identity-gateway';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA LOCAL (Rutas Relativas - Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
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
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

interface AuthPortalProps {
  /** Diccionario local validado por MACS */
  dictionary: Dictionary['auth_portal'];
}

/**
 * APARATO: AuthPortal (Host)
 * @description Orquesta el ciclo de vida de la identidad en el portafolio.
 */
export function AuthPortal({ dictionary }: AuthPortalProps) {
  const pathname = usePathname();
  
  // 1. CONEXIÓN AL ESTADO GLOBAL (Bóveda Zustand)
  const { isAuthModalOpen, closeAuthModal } = useUIStore();

  /**
   * 2. RESOLUCIÓN DE CONTEXTO GEOGRÁFICO (Type-Safe)
   * @description Extrae y valida el idioma actual contra el Códice SSoT.
   */
  const currentLang = useMemo(() => {
    const segment = pathname?.split('/')[1];
    return segment && isValidLocale(segment) ? (segment as Locale) : i18n.defaultLocale;
  }, [pathname]);

  /**
   * HANDLER: handleAuthSuccess
   * @description El punto de unión final. Recibe el éxito de Supabase y 
   *              dispara la sincronización con el núcleo de datos del hotel.
   */
  const handleAuthSuccess = useCallback(async (user: IdentityUser) => {
    const traceId = `hsk_bridge_${Date.now().toString(36).toUpperCase()}`;
    const startTime = performance.now();
    
    console.group(`${C.magenta}${C.bold}[HEIMDALL][AUTH]${C.reset} Bridge Handshake Initiated | Trace: ${C.cyan}${traceId}${C.reset}`);
    console.log(`Identity_Node: ${user.email}`);

    try {
      /**
       * @step Extracción Segura de Metadatos
       * @pilar III: Evitamos 'undefined' asegurando un nombre por defecto.
       */
      const rawMetadata = user.user_metadata || {};
      const identityName = 
        (rawMetadata.full_name as string) || 
        (rawMetadata.name as string) || 
        user.email.split('@')[0];

      /**
       * @step Identity Bridge Sync
       * Sincronizamos la identidad verificada por la librería con Payload CMS.
       * Esto activa automáticamente el reactor de reputación (XP inicial).
       */
      const result = await syncIdentityAction({
        id: user.id,
        email: user.email,
        name: identityName
      });

      const duration = (performance.now() - startTime).toFixed(4);

      if (result.success) {
        console.log(`   ${C.green}✓ [GRANTED]${C.reset} CMS Provisioning successful | Latency: ${duration}ms`);
        
        // Protocolo de Cierre de Bóveda
        closeAuthModal();
        
        /** 
         * @pilar VIII: Resiliencia de Sesión (Browser Safe)
         * Realizamos un refresco de página para asegurar que las Server Actions 
         * de Next.js 15 reconozcan la nueva cookie de sesión en el servidor.
         */
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        /**
         * @pilar VIII: Manejo de Errores Forense.
         * Si el bridge falla, lanzamos el error para que sea capturado 
         * por el manejador interno de la librería y mostrado en el modal.
         */
        console.error(`   ${C.red}✕ [BREACH]${C.reset} Bridge synchronization failed: ${result.error}`);
        throw new Error(result.error || 'UNKNOWN_SYNC_DRIFT');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'IDENTITY_SYNC_ABORTED';
      console.error(`   ${C.red}✕ [CRITICAL]${C.reset} Unexpected drift in Identity Bridge: ${msg}`);
      // Propagamos a la librería para visualización en UI
      throw err; 
    } finally {
      console.groupEnd();
    }
  }, [closeAuthModal]);

  /**
   * @pilar VIII: Resiliencia de Render.
   * Si la estructura de diccionarios es nula, el componente aborta silenciosamente.
   */
  if (!dictionary) return null;

  return (
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={closeAuthModal}
      onSuccess={handleAuthSuccess}
      locale={currentLang}
      /**
       * @pilar IX: Inversión de Control.
       * Inyectamos las etiquetas locales del hotel para sobreescribir el 
       * comportamiento genérico de la librería.
       */
      dictionaryOverrides={dictionary}
    />
  );
}