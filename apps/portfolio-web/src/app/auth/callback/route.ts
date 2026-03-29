/**
 * @file apps/portfolio-web/src/app/auth/callback/route.ts
 * @description Orquestador Soberano de Sincronización de Identidad.
 *              Maneja el intercambio de tokens de Supabase (OAuth/Magic Link)
 *              e inicializa el perfil del Huésped en el Clúster de Identidad.
 * @version 3.0 - Next.js 15 Standard & Identity Initialization
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { i18n } from '../../../config/i18n.config';

/**
 * APARATO PRINCIPAL: GET (Auth Handshake)
 * @description Punto de retorno para Google, Facebook y Apple.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  
  // Detectar idioma para redirecciones de error
  const locale = next.split('/')[1] || i18n.defaultLocale;

  if (code) {
    const cookieStore = await cookies();

    // 1. Verificación de Bóveda de Entorno (Pilar III)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[HEIMDALL][CRITICAL] Auth Config Missing in Production.');
      return NextResponse.redirect(`${origin}/${locale}/server-error?code=AUTH_MISCONFIG`);
    }

    // 2. Instanciación del Cliente de Handshake
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Ignorado en Server Components */ }
        },
      },
    });

    // 3. Intercambio de Código por Sesión Soberana
    console.group(`[HEIMDALL][AUTH] Handshake Initiated: ${new Date().toISOString()}`);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { user } = data;
      const provider = user.app_metadata.provider || 'email';
      
      /**
       * 4. PROTOCOLO DE INICIALIZACIÓN DE HUÉSPED
       * @description Si el usuario es nuevo, Supabase lo registra.
       * Aquí preparamos la metadata para el Clúster de Identidad.
       */
      console.log(`[SUCCESS] Identity Verified via ${provider.toUpperCase()}`);
      console.log(`[USER_ID] ${user.id}`);

      // Telemetría de Metadatos del Dispositivo (MEA/UX)
      //const userAgent = request.headers.get('user-agent') || 'unknown';
      //const isApple = userAgent.toLowerCase().includes('iphone') || provider === 'apple';

      /**
       * @todo En Fase 2: Realizar un upsert en la tabla 'public.users' 
       * para asegurar que el rol 'guest' esté asignado en el CMS.
       */

      console.groupEnd();
      
      // Redirección al Dashboard o a la ruta previa
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error(`[HEIMDALL][AUTH-ERROR] ${error?.message || 'Unknown Exchange Failure'}`);
      console.groupEnd();
    }
  }

  // Fallback ante fallo de handshake
  return NextResponse.redirect(`${origin}/${locale}/auth/error?reason=handshake_failed`);
}