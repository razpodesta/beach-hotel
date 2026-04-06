/**
 * @file apps/portfolio-web/src/app/auth/callback/route.ts
 * @description Orquestador Soberano de Sincronización de Identidad.
 *              Refactorizado para Build-Time Isolation: importaciones dinámicas
 *              y resolución estricta de rutas de monorepo.
 * @version 4.1 - Build Resilient & Boundary Compliant
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar_V: Adherencia arquitectónica mediante importaciones dinámicas.
 */
import { i18n } from '../../../config/i18n.config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  
  const locale = next.split('/')[1] || i18n.defaultLocale;

  if (code) {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Ignorado en Route Handlers */ }
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { user } = data;
      
      /**
       * @pilar XIII: Build Isolation.
       * La importación de 'payload' y 'config' se hace aquí, 
       * solo si hay una sesión válida para procesar.
       */
      try {
        const { getPayload } = await import('payload');
        const configModule = await import('@metashark/cms-core/config');
        const payload = await getPayload({ config: configModule.default });
        
        const existingUser = await payload.find({
          collection: 'users' as any,
          where: { email: { equals: user.email ?? '' } },
          limit: 1
        });

        if (existingUser.docs.length === 0) {
          await payload.create({
            collection: 'users' as any,
            data: {
              email: user.email,
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

      const cleanNext = next === '/' ? `/${locale}/portal` : next;
      const finalUrl = `${origin}${cleanNext.startsWith('/') ? '' : '/'}${cleanNext}`;
      return NextResponse.redirect(finalUrl);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}?auth=error`);
}