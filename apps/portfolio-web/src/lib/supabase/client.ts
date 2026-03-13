/**
 * @file apps/portfolio-web/src/lib/supabase/client.ts
 * @description Exporta la instancia única (Singleton) del cliente de Supabase para el navegador.
 *              Implementa validación fail-fast y anotación de tipos explícita para portabilidad de tipos.
 * @version 5.0 - Explicit Type Portability (Fix TS2742)
 * @author Raz Podestá - MetaShark Tech
 */

import { createBrowserClient } from '@supabase/ssr';
// @pilar III: Importación explícita del tipo base para resolver la portabilidad de tipos en el Monorepo.
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Función de inicialización y validación de infraestructura.
 * @returns {SupabaseClient} Instancia configurada del cliente de Supabase.
 * @throws {Error} Si las variables de entorno obligatorias no están definidas.
 */
function getSupabaseBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /**
   * @pilar VIII: Resiliencia y Guardianes de Contrato.
   * Validación crítica antes de permitir el acceso al cliente.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
    throw new Error(
      `[SUPABASE-CLIENT][CRITICAL] Fallo de infraestructura: Variable ${missing} no encontrada en .env.local`
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * INSTANCIA SOBERANA (Singleton)
 * @pilar III: Anotación de tipo explícita SupabaseClient.
 * Esto erradica el error TS2742 al facilitar que el compilador nombre el tipo
 * sin tener que rastrear referencias circulares o internas de pnpm.
 */
export const supabase: SupabaseClient = getSupabaseBrowserClient();