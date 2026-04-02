/**
 * @file apps/portfolio-web/src/app/auth/callback/route.ts
 * @description Orquestador Soberano de Sincronización de Identidad.
 *              Maneja el intercambio de tokens de Supabase (OAuth/Magic Link)
 *              e implementa el "Identity Bridge" para sincronizar automáticamente 
 *              al huésped con el clúster de Payload CMS (SSoT).
 * @version 4.0 - Next.js 15 & CMS Identity Bridge 
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { getPayload } from 'payload';
import configPromise from '@metashark/cms-core/config';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA
 * @pilar_V: Adherencia arquitectónica.
 */
import { i18n } from '../../../config/i18n.config';

/**
 * APARATO PRINCIPAL: GET (Auth Handshake)
 * @description Punto de retorno inmutable para proveedores OAuth y enlaces mágicos.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  
  // Detectar idioma para redirecciones de error (Fallback seguro)
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
          } catch { 
            // Ignorado intencionalmente: En Route Handlers puede fallar si 
            // las cabeceras ya fueron enviadas, pero el middleware lo respaldará.
          }
        },
      },
    });

    // 3. Intercambio Criptográfico
    const traceId = `oauth_${Date.now()}`;
    console.group(`[HEIMDALL][AUTH] Handshake Initiated: ${traceId}`);
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { user } = data;
      const email = user.email;
      const provider = user.app_metadata.provider || 'email';
      
      console.log(`[SUCCESS] Identity Verified via ${provider.toUpperCase()}`);

      /**
       * 4. THE IDENTITY BRIDGE (Sincronización CMS SSoT)
       * @description Aseguramos que la identidad exista en el ecosistema operativo
       *              antes de dejar que el usuario acceda a zonas restringidas (RBAC).
       */
      if (email) {
        try {
          const payload = await getPayload({ config: await configPromise });
          
          const existingUser = await payload.find({
            collection: 'users',
            where: { email: { equals: email } },
            limit: 1
          });

          if (existingUser.docs.length === 0) {
            console.log(`[SYNC] First-time OAuth detection. Provisioning CMS Identity...`);
            
            // Password de fallback criptográfico (deshabilitado para acceso manual, solo OAuth)
            const fallbackPassword = crypto.randomBytes(32).toString('hex');
            
            await payload.create({
              collection: 'users',
              data: {
                email: email,
                password: fallbackPassword,
                role: 'guest',
                tenant: '00000000-0000-0000-0000-000000000001', // Master Tenant Genesis ID
                _verified: true,
                level: 1,
                experiencePoints: 0
              }
            });
            console.log(`[SUCCESS] Identity bridged to Sovereign CMS.`);
          } else {
            console.log(`[SYNC] Existing identity synced with CMS Cluster.`);
          }
        } catch (syncError) {
          /**
           * @pilar_VIII: Resiliencia Fail-Safe.
           * Si el CMS está inaccesible o la BD fluctúa, no bloqueamos el login. 
           * Reportamos el error pero permitimos que la sesión de Supabase fluya.
           */
          const msg = syncError instanceof Error ? syncError.message : 'Unknown CMS DB Drift';
          console.error(`[CRITICAL] Identity Bridge Failed: ${msg}`);
        }
      }

      console.groupEnd();
      
      /**
       * 5. SMART ROUTING (MEA/UX)
       * @description Si el destino es puramente la raíz ('/'), asumimos que 
       *              el objetivo principal tras el login es el Dashboard.
       */
      const cleanNext = next === '/' ? `/${locale}/portal` : next;
      
      // Saneamiento Anti-Double-Slash
      const finalUrl = `${origin}${cleanNext.startsWith('/') ? '' : '/'}${cleanNext}`;
      return NextResponse.redirect(finalUrl);
      
    } else {
      console.error(`[HEIMDALL][AUTH-ERROR] ${error?.message || 'Unknown Exchange Failure'}`);
      console.groupEnd();
    }
  }

  // Fallback ante fallo de handshake o falta de código
  return NextResponse.redirect(`${origin}/${locale}?auth=error`);
}