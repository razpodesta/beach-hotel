/**
 * @file apps/portfolio-web/src/app/auth/callback/route.ts
 * @description Punto de entrada soberano para retornos de identidad (OAuth).
 *              Actúa como el puente de red entre Supabase Auth y el Identity Bridge.
 *              Refactorizado: Sincronización con el nuevo puerto de servidor de
 *              la librería (@metashark/identity-access-management/server) y erradicación
 *              de extensiones .js para resolución "bundler" (Next.js 15).
 *              Nivelado: Saneamiento de Linter (Erradicación de console.log).
 * @version 6.5 - Server Export, Bundler Sync & Lint Pure
 * @author Raz Podestá - MetaShark Tech
 */

/** 
 * ALINEACIÓN ARQUITECTÓNICA (Server Isolation)
 * @description Importamos exclusivamente desde el entry point de servidor de la librería,
 * garantizando que Next.js no arrastre este código al entorno del cliente.
 */
import { handleOAuthCallback } from '@metashark/identity-access-management/server';

/**
 * IMPORTACIÓN DE CONTRATOS E INFRAESTRUCTURA LOCAL
 * @pilar V: Adherencia Arquitectónica. Erradicación de extensiones .js.
 */
import { syncIdentityAction } from '../../../lib/portal/actions/auth-sync.actions';
import { i18n, isValidLocale } from '../../../config/i18n.config';

/** 
 * IMPORTACIÓN DE CONTRATOS EXTERNOS 
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
   * Delegamos el handshake técnico a la librería @metashark/identity-access-management.
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

      /** @fix: console.log -> console.info para cumplimiento Linter v10.0 */
      console.info(`   → [DNA][BRIDGE] Identity Linked: ${supabaseUser.email}`);
      
      // Handshake de Sincronización con el Núcleo (Silo D)
      const syncResult = await syncIdentityAction({
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: fullName
      });

      const totalLatency = (performance.now() - startTime).toFixed(4);
      const syncLatency = (performance.now() - syncStart).toFixed(4);

      if (syncResult.success) {
        /** @fix: console.log -> console.info para cumplimiento Linter v10.0 */
        console.info(`   ✓ [GRANTED] Bridge Sync Success | Lat: ${syncLatency}ms | Total: ${totalLatency}ms`);
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