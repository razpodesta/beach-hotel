/**
 * @file apps/portfolio-web/src/components/ui/AuthPortal.tsx
 * @description Host Wrapper para el Identity Gateway.
 *              Actúa como el puente de integración entre la librería autónoma
 *              y el ecosistema local (Zustand + Payload Sync).
 *              Refactorizado: Limpieza de variables no utilizadas y sellado de
 *              trazabilidad forense Heimdall v2.5.
 * @version 1.1 - Linter Pure & Forensic Ready
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * IMPORTACIONES DE LIBRERÍA SOBERANA
 * @pilar IX: Si persiste el error TS2307, ejecutar 'pnpm nx reset'.
 */
import { AuthModal, type IdentityUser } from '@metashark/identity-gateway';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA LOCAL
 */
import { useUIStore } from '../../lib/store/ui.store';
import { syncIdentityAction } from '../../lib/portal/actions/auth-sync.actions';
import { i18n, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

interface AuthPortalProps {
  /** Diccionario local validado por MACS */
  dictionary: Dictionary['auth_portal'];
}

/**
 * APARATO: AuthPortal (Host)
 * @description Orquesta la visibilidad de la librería de identidad en el portafolio.
 */
export function AuthPortal({ dictionary }: AuthPortalProps) {
  const pathname = usePathname();
  
  // 1. CONEXIÓN AL ESTADO GLOBAL (Zustand)
  const { isAuthModalOpen, closeAuthModal } = useUIStore();

  // 2. RESOLUCIÓN DE IDIOMA PARA LA LIBRERÍA
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  /**
   * HANDLER: handleAuthSuccess
   * @description El punto de unión final. Recibe el éxito de Supabase y 
   *              dispara la sincronización con Payload CMS.
   */
  const handleAuthSuccess = useCallback(async (user: IdentityUser) => {
    /** 
     * @fix: Resolución de TS6133 (traceId)
     * Integramos el token en el log de orquestación para trazabilidad forense.
     */
    const traceId = `ui_sync_${Date.now().toString(36).toUpperCase()}`;
    
    console.group(`[HEIMDALL][AUTH] Library Handshake SUCCESS | Trace: ${traceId}`);
    console.log(`Identity linked: ${user.email}`);

    try {
      // Handshake con el Bridge de la App
      const result = await syncIdentityAction({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name
      });

      if (result.success) {
        console.log(`[GRANTED] Identity fully indexed in CMS. Closing Gateway.`);
        closeAuthModal();
        // Recarga estratégica para hidratar datos de sesión del servidor
        window.location.reload();
      } else {
        console.error(`[BREACH] CMS Sync failed: ${result.error}`);
      }
    } catch (err) {
      console.error(`[CRITICAL] Unexpected drift during auth success flow.`, err);
    } finally {
      console.groupEnd();
    }
  }, [closeAuthModal]);

  /**
   * @pilar VIII: Resiliencia.
   * El modal de la librería es auto-contenido, inyectamos los overrides del diccionario local.
   */
  return (
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={closeAuthModal}
      onSuccess={handleAuthSuccess}
      locale={currentLang}
      dictionaryOverrides={dictionary}
    />
  );
}