/**
 * @file apps/portfolio-web/src/lib/supabase/client.ts
 * @description Orquestador Soberano del Cliente Supabase (Browser Context).
 *              Implementa el patrón Singleton con inicialización trazada y 
 *              resiliencia ante entornos de construcción estática.
 * @version 6.0 - Forensic Observability & Build Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * FABRICA SOBERANA DE CLIENTE
 * @description Centraliza la lógica de instanciación con validación perimetral.
 * @returns {SupabaseClient} Instancia configurada del cliente de Supabase.
 * @pilar IV: Observabilidad - Implementa trazabilidad mediante Protocolo Heimdall.
 * @pilar VIII: Resiliencia - Gestiona la ausencia de variables en modo build.
 */
function createSovereignBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Trazabilidad de inicio de handshake
  console.group('[HEIMDALL][INFRASTRUCTURE] Supabase Browser Handshake');

  /**
   * GUARDIA DE INFRAESTRUCTRURA (Fail-Fast)
   * Solo lanzamos el error si estamos en el navegador. Durante el build 
   * (server-side analysis), permitimos que falle silenciosamente con una 
   * advertencia para no bloquear el pipeline de Vercel.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    const isBrowser = typeof window !== 'undefined';
    const errorMessage = `Faltan variables de entorno críticas: ${
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    }`;

    if (isBrowser) {
      console.error(`[CRITICAL] ${errorMessage}`);
      console.groupEnd();
      throw new Error(errorMessage);
    } else {
      console.warn(`[BUILD-AWARE] ${errorMessage}. Handshake pospuesto para Runtime.`);
    }
  } else {
    console.log('[SUCCESS] Identidad de infraestructura verificada.');
  }

  const client = createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  );

  console.log('[STATUS] Cliente Supabase instanciado correctamente.');
  console.groupEnd();

  return client;
}

/**
 * INSTANCIA SOBERANA (Singleton)
 * @description Exportación del cliente con anotación de tipo explícita para 
 *              garantizar la portabilidad de tipos en el Monorepo (Fix TS2742).
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const supabase: SupabaseClient = createSovereignBrowserClient();