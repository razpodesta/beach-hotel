/**
 * @file apps/portfolio-web/src/app/auth/callback/route.ts
 * @description Punto de entrada soberano para retornos de identidad (OAuth).
 *              Actúa como el puente de red entre Supabase Auth y el Identity Bridge.
 *              Refactorizado: Resolución de TS7006, inyección de telemetría Heimdall
 *              y blindaje de extracción de metadatos.
 * @version 6.3 - Total Latency Tracking & Type Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import { handleOAuthCallback } from '@metashark/identity-gateway';
import { syncIdentityAction } from '../../../lib/portal/actions/auth-sync.actions.js';
import { i18n, isValidLocale } from '../../../config/i18n.config.js';

/** 
 * IMPORTACIÓN DE CONTRATOS DE INFRAESTRUCTRURA 
 * @pilar III: Seguridad de Tipos Absoluta. 
 */
import type { User } from '@supabase/supabase-js';

/**
 * APARATO: GET (OAuth Callback Handler)
 * @description Procesa el intercambio de código por sesión y sincroniza con el CMS.
 * @pilar IX: Inversión de Control (IoC).
 */
export async function GET(request: Request) {
  const startTime = performance.now();
  const requestTraceId = `oauth_cb_${Date.now().toString(36).toUpperCase()}`;

  console.group(`[HEIMDALL][AUTH] Incoming OAuth Handshake | Trace: ${requestTraceId}`);

  /**
   * Delegamos el handshake técnico a la librería @metashark/identity-gateway.
   * La librería verifica la identidad humana y criptográfica.
   */
  return handleOAuthCallback(request, {
    defaultLocale: i18n.defaultLocale,
    isValidLocale: isValidLocale,
    defaultRedirect: '/portal',

    /**
     * @callback onIdentityVerified
     * @description El eslabón que une la Identidad Criptográfica con los Datos del CMS.
     */
    onIdentityVerified: async (supabaseUser: User, traceId: string) => {
      const syncStart = performance.now();
      
      /**
       * @pilar III: Seguridad de Tipos.
       * Extracción segura de identidad con fallbacks deterministas.
       */
      const userMetadata = supabaseUser.user_metadata || {};
      const fullName = (userMetadata.full_name as string) || 
                       (userMetadata.name as string) || 
                       'Sovereign Guest';

      console.log(`   → [DNA][BRIDGE] Identity Linked: ${supabaseUser.email}`);
      
      // Handshake de Sincronización con el Núcleo (Silo D)
      const syncResult = await syncIdentityAction({
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: fullName
      });

      const totalLatency = (performance.now() - startTime).toFixed(4);
      const syncLatency = (performance.now() - syncStart).toFixed(4);

      if (syncResult.success) {
        console.log(`   ✓ [GRANTED] Bridge Sync Success | Lat: ${syncLatency}ms | Total: ${totalLatency}ms`);
      } else {
        /**
         * @pilar VIII: Resiliencia.
         * Si el bridge falla, el usuario ya tiene sesión en Supabase pero no en el CMS.
         * Reportamos la brecha para auditoría forense inmediata.
         */
        console.error(
          `   ✕ [BREACH] Identity Bridge Failure | User: ${supabaseUser.email} | Reason: ${syncResult.error} | Trace: ${traceId}`
        );
      }
      
      console.groupEnd();
    }
  });
}