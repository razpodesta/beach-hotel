/**
 * @file packages/identity-access-management/src/handlers/oauth-callback.ts
 * @description Orquestador Agnóstico de Intercambio de Código (OAuth Bridge).
 *              Refactorizado: Normalización de resolución de módulos para Next.js 15.
 *              Estabilizado: Gestión de cookies persistente para entornos Edge,
 *              alineación SSoT de dominio base y cumplimiento estricto del linter
 *              (erradicación de console.log).
 * @version 2.0 - Bundler Resolution & Domain SSoT
 * @author Staff Engineer - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

/** 
 * IMPORTACIÓN DE CONTRATOS EXTERNOS 
 */
import type { User } from '@supabase/supabase-js';

export interface OAuthHandlerOptions {
  onIdentityVerified?: (user: User, traceId: string) => Promise<void>;
  defaultRedirect?: string;
  defaultLocale?: string;
  isValidLocale?: (locale: string) => boolean;
}

/**
 * @function handleOAuthCallback
 * @description Punto de entrada para procesar el intercambio de código de Supabase.
 * @pilar IX: Inversión de Control.
 */
export async function handleOAuthCallback(
  request: Request,
  options: OAuthHandlerOptions
) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? options.defaultRedirect ?? '/';
  const traceId = `oauth_bridge_${Date.now().toString(36).toUpperCase()}`;

  /**
   * SSoT DOMAIN RESOLUTION
   * @description Fuerza la redirección al NEXT_PUBLIC_BASE_URL para evitar
   * Domain Mismatch si Vercel asigna un host dinámico durante la carga.
   */
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const dynamicOrigin = host ? `${protocol}://${host}` : requestUrl.origin;
  const baseOrigin = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || dynamicOrigin;

  // 1. RESOLUCIÓN DE CONTEXTO GEOGRÁFICO
  const pathSegments = next.split('/').filter(Boolean);
  const detectedLocale = pathSegments[0];
  const locale = (options.isValidLocale?.(detectedLocale) ? detectedLocale : options.defaultLocale) ?? 'en-US';

  // 2. GUARDIA DE PROTOCOLO: Fallo por ausencia de código
  if (!code) {
    console.error(`[HEIMDALL][AUTH] ${traceId} | Breach: Missing exchange code.`);
    return NextResponse.redirect(`${baseOrigin}/${locale}?auth=error&reason=no_code`);
  }

  // 3. INICIALIZACIÓN DE INFRAESTRUCTURA (Safe Sync)
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(`[HEIMDALL][CRITICAL] ${traceId} | Infrastructure Missing: Supabase Config.`);
    return NextResponse.redirect(`${baseOrigin}/${locale}/server-error?code=AUTH_MISCONFIG`);
  }

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
      console.info(`   → [DNA] Verifying identity for node: ${data.user.email}`);
      await options.onIdentityVerified(data.user, traceId);
    }

    // 6. REDIRECCIÓN DETERMINISTA
    const finalPath = next.startsWith('/') ? next : `/${next}`;
    const finalUrl = `${baseOrigin}${finalPath}`;
    
    console.info(`   ✓ [GRANTED] Access verified. Target: ${finalUrl}`);
    return NextResponse.redirect(finalUrl);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Identity Drift';
    console.error(`   ✕ [REJECTED] Handshake failed: ${msg} | Trace: ${traceId}`);
    return NextResponse.redirect(`${baseOrigin}/${locale}?auth=error&reason=exchange_failed`);
  } finally {
    console.groupEnd();
  }
}