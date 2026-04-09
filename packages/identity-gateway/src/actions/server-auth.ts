/**
 * @file packages/identity-gateway/src/actions/server-auth.ts
 * @description Orquestador de Acceso Soberano (Server Actions).
 *              Encapsula la comunicación con Supabase Auth, validación L0
 *              y gestión de estados de identidad sin dependencias de CMS.
 *              Refactorizado: Erradicación de aserciones '!', validación de 
 *              infraestructura y aplanamiento de contratos.
 * @version 5.1 - Resilience & ESM Hardened
 * @author Raz Podestá - MetaShark Tech
 */

'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { verifyReCaptcha } from '../security/recaptcha.js';
import { 
  loginCredentialsSchema, 
  registerCredentialsSchema,
  type IdentityUser
} from '../schemas/auth.schema.js';

/**
 * @description Tipo de retorno estandarizado para todas las acciones de identidad.
 * @pilar III: Inferencia de tipos para el manejo de estados en la UI.
 */
export type AuthActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'INVALID_PAYLOAD' | 'BOT_DETECTED' | 'AUTH_FAILURE' | 'SERVER_ERROR' | 'INFRA_ERROR';
};

/**
 * @function getSupabaseServerClient
 * @description Inicializa el cliente de Supabase con validación de perímetro.
 * @throws {Error} Si faltan las llaves de infraestructura.
 */
async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /**
   * @pilar VIII: Resiliencia de Infraestructura.
   * Evitamos el uso de '!' mediante validación explícita de entorno.
   */
  if (!url || !anonKey) {
    console.error('[HEIMDALL][INFRA] Missing Supabase environment variables.');
    throw new Error('INFRASTRUCTURE_UNSTABLE');
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // El middleware o server components podrían intentar setear cookies; 
          // capturamos silenciosamente para evitar bloqueos de renderizado.
        }
      },
    },
  });
}

/**
 * ACTION: loginAction
 * @description Procesa el inicio de sesión con validación anti-bot y sincronía de sesión.
 */
export async function loginAction(rawCredentials: unknown): Promise<AuthActionResult<IdentityUser>> {
  const traceId = `login_${Date.now().toString(36).toUpperCase()}`;
  console.group(`[HEIMDALL][AUTH] Login Handshake: ${traceId}`);

  try {
    const validation = loginCredentialsSchema.safeParse(rawCredentials);
    if (!validation.success) {
      return { success: false, code: 'INVALID_PAYLOAD', error: 'Handshake data malformed' };
    }

    const { email, password, recaptchaToken } = validation.data;

    // Validación Humana L0
    const isHuman = await verifyReCaptcha(recaptchaToken, 0.5, traceId);
    if (!isHuman) {
      return { success: false, code: 'BOT_DETECTED', error: 'Security gate rejected request' };
    }

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.warn(`[BREACH] Authentication failed: ${email} | ${error.message}`);
      return { success: false, code: 'AUTH_FAILURE', error: error.message };
    }

    /**
     * @pilar III: Seguridad de Tipos.
     * Devolvemos el usuario directamente para cumplir con el contrato IdentityUser.
     */
    console.log(`[GRANTED] Identity verified: ${email}`);
    return { 
      success: true, 
      data: data.user as unknown as IdentityUser 
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'CORE_ENGINE_DRIFT';
    console.error(`[CRITICAL] Internal failure in Silo D: ${msg}`);
    return { success: false, code: 'SERVER_ERROR', error: msg };
  } finally {
    console.groupEnd();
  }
}

/**
 * ACTION: registerAction
 * @description Crea una nueva identidad soberana con metadatos extendidos.
 */
export async function registerAction(rawCredentials: unknown): Promise<AuthActionResult<IdentityUser>> {
  const traceId = `reg_${Date.now().toString(36).toUpperCase()}`;
  console.group(`[HEIMDALL][AUTH] Registration Pipeline: ${traceId}`);

  try {
    const validation = registerCredentialsSchema.safeParse(rawCredentials);
    if (!validation.success) {
      return { success: false, code: 'INVALID_PAYLOAD', error: 'Registration contract violation' };
    }

    const { email, password, name, recaptchaToken, newsletterOptIn } = validation.data;

    const isHuman = await verifyReCaptcha(recaptchaToken, 0.5, traceId);
    if (!isHuman) {
      return { success: false, code: 'BOT_DETECTED', error: 'Handshake rejected by Sentinel' };
    }

    const supabase = await getSupabaseServerClient();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          newsletter_opt_in: !!newsletterOptIn,
          origin_node: 'IDENTITY_GATEWAY_V1',
          trace_id: traceId
        }
      }
    });

    if (error) {
      return { success: false, code: 'AUTH_FAILURE', error: error.message };
    }

    console.log(`[SUCCESS] New identity provisioned: ${email}`);
    return { 
      success: true, 
      data: data.user as unknown as IdentityUser 
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'CORE_ENGINE_DRIFT';
    return { success: false, code: 'SERVER_ERROR', error: msg };
  } finally {
    console.groupEnd();
  }
}

/**
 * ACTION: signOutAction
 */
export async function signOutAction(): Promise<AuthActionResult> {
  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'SIGNOUT_FAILED' };
  }
}