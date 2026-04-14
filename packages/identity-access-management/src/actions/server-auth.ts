/**
 * @file packages/identity-access-management/src/actions/server-auth.ts
 * @description Orquestador de Acceso Autenticado (IAM Server Actions).
 *              Encapsula la comunicación con Supabase Auth y validación L0.
 *              Refactorizado: Resolución dinámica de BASE_URL para Vercel.
 *              Nivelado: Sincronización con el Puerto Soberano 4200 y Linter Pure.
 * 
 * @version 7.0 - Vercel Production Ready & Port 4200 Sync
 * @author Staff Engineer - MetaShark Tech
 */

'use server';

import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { verifyReCaptcha } from '../security/recaptcha';
import { 
  loginCredentialsSchema, 
  registerCredentialsSchema,
  type IdentityUser
} from '../schemas/auth.schema';

/**
 * @description Tipo de retorno estandarizado para todas las acciones de identidad.
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
 */
async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = !url ? 'SUPABASE_URL' : 'SUPABASE_ANON_KEY';
    console.error(`[HEIMDALL][CRITICAL] Missing Infrastructure Key: ${missing}`);
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
          // Bypass para prerendering estático en Vercel
        }
      },
    },
  });
}

/**
 * ACTION: signInWithOAuthAction
 * @description Inicia el flujo de autenticación con proveedores externos (Google/Apple).
 * @fix Erradica redirección a localhost:3000 priorizando el dominio de Vercel.
 */
export async function signInWithOAuthAction(
  provider: 'google' | 'apple' | 'facebook',
  nextPath = '/portal'
): Promise<AuthActionResult<{ url: string }>> {
  const traceId = `oauth_init_${Date.now().toString(36).toUpperCase()}`;
  console.group(`${C_MAGENTA}[HEIMDALL][AUTH] OAuth Handshake: ${traceId}${C_RESET}`);

  try {
    const supabase = await getSupabaseServerClient();
    
    /** 
     * RESOLUCIÓN SOBERANA DE URL 
     * @pilar VIII: Resiliencia - Si NEXT_PUBLIC_BASE_URL no está en el .env, 
     * intentamos extraer el host real de la petición actual en Vercel.
     */
    const headerList = await headers();
    const host = headerList.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      || (host ? `${protocol}://${host}` : 'http://localhost:4200');
    
    // Construcción del callback URL con propagación del destino final
    const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    /** @fix: console.log -> console.info */
    console.info(`   → [DOMAIN_SYNC] Base: ${baseUrl}`);
    console.info(`   → [PROVIDER] Initiating flow with ${provider.toUpperCase()}`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('OAUTH_URL_GENERATION_FAILED');

    console.info(`   ✓ [GRANTED] Redirect URL generated for ${provider}`);
    return { success: true, data: { url: data.url } };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'OAUTH_ENGINE_DRIFT';
    console.error(`   ✕ [CRITICAL] OAuth flow aborted: ${msg}`);
    return { success: false, code: 'SERVER_ERROR', error: msg };
  } finally {
    console.groupEnd();
  }
}

/**
 * ACTION: loginAction
 * @description Procesa el inicio de sesión con validación anti-bot.
 */
export async function loginAction(rawCredentials: unknown): Promise<AuthActionResult<IdentityUser>> {
  const traceId = `login_${Date.now().toString(36).toUpperCase()}`;
  console.group(`${C_CYAN}[HEIMDALL][AUTH] Login Handshake: ${traceId}${C_RESET}`);

  try {
    const validation = loginCredentialsSchema.safeParse(rawCredentials);
    if (!validation.success) {
      return { success: false, code: 'INVALID_PAYLOAD', error: 'Handshake data malformed' };
    }

    const { email, password, recaptchaToken } = validation.data;

    const isHuman = await verifyReCaptcha(recaptchaToken, 0.5, traceId);
    if (!isHuman) {
      return { success: false, code: 'BOT_DETECTED', error: 'Security gate rejected request' };
    }

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.warn(`   ⚠ [BREACH] Authentication failed: ${email} | ${error.message}`);
      return { success: false, code: 'AUTH_FAILURE', error: error.message };
    }

    console.info(`   ✓ [IDENTIFIED] Node recognized: ${email}`);
    return { 
      success: true, 
      data: data.user as unknown as IdentityUser 
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'CORE_ENGINE_DRIFT';
    console.error(`   ✕ [CRITICAL] Internal failure: ${msg}`);
    return { success: false, code: 'SERVER_ERROR', error: msg };
  } finally {
    console.groupEnd();
  }
}

/**
 * ACTION: registerAction
 * @description Crea una nueva identidad con metadatos de grado IAM.
 */
export async function registerAction(rawCredentials: unknown): Promise<AuthActionResult<IdentityUser>> {
  const traceId = `reg_${Date.now().toString(36).toUpperCase()}`;
  console.group(`${C_MAGENTA}[HEIMDALL][AUTH] Registration Pipeline: ${traceId}${C_RESET}`);

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
          origin_node: 'IAM_SERVICE_V31', // Sello MES
          trace_id: traceId
        }
      }
    });

    if (error) {
      return { success: false, code: 'AUTH_FAILURE', error: error.message };
    }

    /** @fix: console.log -> console.info */
    console.info(`   ✓ [SUCCESS] New identity provisioned: ${email}`);
    return { 
      success: true, 
      data: data.user as unknown as IdentityUser 
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'CORE_ENGINE_DRIFT';
    console.error(`   ✕ [CRITICAL] Registration failure: ${msg}`);
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

// Auxiliares de color para terminal (Heimdall v2.5)
const C_MAGENTA = '\x1b[35m';
const C_CYAN = '\x1b[36m';
const C_RESET = '\x1b[0m';