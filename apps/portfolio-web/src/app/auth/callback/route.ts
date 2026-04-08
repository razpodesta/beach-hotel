/**
 * @file apps/portfolio-web/src/app/auth/callback/route.ts
 * @description Orquestador Soberano de Sincronización de Identidad (Callback Bridge).
 *              Refactorizado: Erradicación de non-null assertions, tipado estricto
 *              y blindaje de identidad forense.
 * @version 5.1 - Identity Bridge & Type-Safe
 * @author Raz Podestá -  MetaShark Tech
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { getPayload } from 'payload';
import { i18n, isValidLocale, type Locale } from '../../../config/i18n.config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal';
  
  const locale = next.split('/')[1] && isValidLocale(next.split('/')[1]) 
    ? (next.split('/')[1] as Locale) 
    : i18n.defaultLocale;

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}?auth=error`);
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[HEIMDALL][CRITICAL] Auth Config Missing.');
    return NextResponse.redirect(`${origin}/${locale}/server-error?code=AUTH_MISCONFIG`);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[HEIMDALL][AUTH] Code exchange failed:', error);
    return NextResponse.redirect(`${origin}/${locale}?auth=error`);
  }

  // Identidad validada
  const userEmail = data.user.email;
  
  // Guardias de seguridad para tipos (Pilar III: Seguridad de Tipos Absoluta)
  if (!userEmail) {
    console.error('[HEIMDALL][SECURITY] Auth User missing email claim.');
    return NextResponse.redirect(`${origin}/${locale}?auth=error`);
  }

  // 2. Identity Bridge: Sincronización con el CMS Core
  try {
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });

    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: userEmail } },
      limit: 1
    });

    if (existingUser.docs.length === 0) {
      console.log(`[HEIMDALL][IDENTITY] Provisioning new identity for: ${userEmail}`);
      await payload.create({
        collection: 'users',
        data: {
          email: userEmail,
          password: crypto.randomBytes(32).toString('hex'),
          role: 'guest',
          tenant: '00000000-0000-0000-0000-000000000001',
          _verified: true
        }
      });
    }
  } catch (syncError) {
    console.error(`[CRITICAL] Identity Bridge Failed:`, syncError);
  }

  // 3. Redirección final con continuidad
  const finalPath = next.startsWith('/') ? next : `/${next}`;
  const finalUrl = `${origin}${finalPath}`;
  
  console.log(`[HEIMDALL][AUTH] Dispatching Identity to: ${finalUrl}`);
  return NextResponse.redirect(finalUrl);
}