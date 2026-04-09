/**
 * @file packages/identity-gateway/src/handlers/oauth-callback.ts
 * @description Orquestador Agnóstico de Intercambio de Código (OAuth Bridge).
 *              Refactorizado: Cumplimiento de ESM estricto y tipado de élite.
 * @version 1.2 - ESM Compliant (Fix TS2307 Chain)
 * @author Raz Podestá - MetaShark Tech
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
 */
export interface OAuthHandlerOptions {
  onIdentityVerified?: (user: User, traceId: string) => Promise<void>;
  defaultRedirect?: string;
  defaultLocale?: string;
  isValidLocale?: (locale: string) => boolean;
}

/**
 * @function handleOAuthCallback
 * @description Procesa el intercambio de código de Supabase Auth.
 */
export async function handleOAuthCallback(
  request: Request,
  options: OAuthHandlerOptions
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? options.defaultRedirect ?? '/';
  const traceId = `oauth_bridge_${Date.now().toString(36).toUpperCase()}`;

  const pathSegments = next.split('/').filter(Boolean);
  const detectedLocale = pathSegments[0];
  const locale = (options.isValidLocale?.(detectedLocale) ? detectedLocale : options.defaultLocale) ?? 'en-US';

  if (!code) {
    console.error(`[HEIMDALL][AUTH] ${traceId} | Missing exchange code.`);
    return NextResponse.redirect(`${origin}/${locale}?auth=error&reason=no_code`);
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(`[HEIMDALL][CRITICAL] ${traceId} | Supabase Config Missing.`);
    return NextResponse.redirect(`${origin}/${locale}/server-error?code=AUTH_MISCONFIG`);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { 
           // Handled by Next.js 15 response logic
        }
      },
    },
  });

  console.group(`[HEIMDALL][AUTH] OAuth Handshake: ${traceId}`);

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      throw new Error(error?.message || 'Identity exchange failed');
    }

    if (options.onIdentityVerified) {
      await options.onIdentityVerified(data.user, traceId);
    }

    const finalPath = next.startsWith('/') ? next : `/${next}`;
    const finalUrl = `${origin}${finalPath}`;
    
    console.log(`[GRANTED] Identity verified. Redirecting to: ${finalUrl}`);
    return NextResponse.redirect(finalUrl);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Identity Drift';
    console.error(`[REJECTED] ${traceId} | ${msg}`);
    return NextResponse.redirect(`${origin}/${locale}?auth=error&reason=exchange_failed`);
  } finally {
    console.groupEnd();
  }
}