/**
 * @file packages/identity-gateway/src/handlers/oauth-callback.ts
 * @description Orquestador Agnóstico de Intercambio de Código (OAuth Bridge).
 *              Refactorizado: Normalización de resolución de módulos para Next.js 15.
 *              Estabilizado: Gestión de cookies persistente para entornos Edge.
 *              Sincronizado: Protocolo Heimdall v2.5 para auditoría de handshakes.
 * @version 1.3 - Bundler Resolution Standard (Vercel Fix)
 * @author Staff Engineer - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** 
 * IMPORTACIÓN DE CONTRATOS EXTERNOS 
 */
import type { User } from '@supabase/supabase-js';

/**
 * @interface OAuthHandlerOptions
 * @description Configuración inyectable para el comportamiento del puente.
 */
export interface OAuthHandlerOptions {
  /** Callback disparado tras la verificación criptográfica exitosa */
  onIdentityVerified?: (user: User, traceId: string) => Promise<void>;
  /** Ruta de retorno por defecto si no se especifica en el estado */
  defaultRedirect?: string;
  /** Idioma de fallback para redirecciones de error */
  defaultLocale?: string;
  /** Función de validación de perímetros de idioma */
  isValidLocale?: (locale: string) => boolean;
}

/**
 * @function handleOAuthCallback
 * @description Punto de entrada para procesar el intercambio de código de Supabase.
 * @pilar IX: Inversión de Control. La lógica técnica reside aquí, la persistencia en el host.
 */
export async function handleOAuthCallback(
  request: Request,
  options: OAuthHandlerOptions
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? options.defaultRedirect ?? '/';
  const traceId = `oauth_bridge_${Date.now().toString(36).toUpperCase()}`;

  // 1. RESOLUCIÓN DE CONTEXTO GEOGRÁFICO
  const pathSegments = next.split('/').filter(Boolean);
  const detectedLocale = pathSegments[0];
  const locale = (options.isValidLocale?.(detectedLocale) ? detectedLocale : options.defaultLocale) ?? 'en-US';

  // 2. GUARDIA DE PROTOCOLO: Fallo por ausencia de código
  if (!code) {
    console.error(`[HEIMDALL][AUTH] ${traceId} | Breach: Missing exchange code.`);
    return NextResponse.redirect(`${origin}/${locale}?auth=error&reason=no_code`);
  }

  // 3. INICIALIZACIÓN DE INFRAESTRUCTURA (Safe Sync)
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(`[HEIMDALL][CRITICAL] ${traceId} | Infrastructure Missing: Supabase Config.`);
    return NextResponse.redirect(`${origin}/${locale}/server-error?code=AUTH_MISCONFIG`);
  }

  /**
   * CLIENTE SOBERANO (Server-Side Context)
   * @pilar VIII: Resiliencia - Manejo seguro de cookies en el worker de borde.
   */
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            cookieStore.set(name, value, cookieOptions)
          );
        } catch { 
           // Captura silenciosa para evitar bloqueos en pre-renderizado estático
        }
      },
    },
  });

  console.group(`[HEIMDALL][AUTH] OAuth Handshake Initiated: ${traceId}`);

  try {
    // 4. INTERCAMBIO CRIPTOGRÁFICO (Code-to-Session)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      throw new Error(error?.message || 'Identity exchange failed');
    }

    // 5. DISPACHO DE EVENTO SOBERANO
    if (options.onIdentityVerified) {
      console.log(`   → [DNA] Verifying identity for node: ${data.user.email}`);
      await options.onIdentityVerified(data.user, traceId);
    }

    // 6. REDIRECCIÓN DETERMINISTA
    const finalPath = next.startsWith('/') ? next : `/${next}`;
    const finalUrl = `${origin}${finalPath}`;
    
    console.log(`   ✓ [GRANTED] Access verified. Target: ${finalUrl}`);
    return NextResponse.redirect(finalUrl);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Identity Drift';
    console.error(`   ✕ [REJECTED] Handshake failed: ${msg} | Trace: ${traceId}`);
    return NextResponse.redirect(`${origin}/${locale}?auth=error&reason=exchange_failed`);
  } finally {
    console.groupEnd();
  }
}