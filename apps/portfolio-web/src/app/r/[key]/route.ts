/**
 * @file apps/portfolio-web/src/app/r/[key]/route.ts
 * @description Enterprise Routing Engine (Dynamic Gateway Resolver v3.1).
 *              Refactorizado: Resolución de TS2339 mediante Estrechamiento de Tipo Literal
 *              (Literal Type Narrowing) en la orquestación de llamadas a Payload, 
 *              erradicando la ambigüedad del union type de Colecciones.
 * @version 4.4 - Literal Type Sealed & Build-Hardened
 * @author Raz Podestá -  MetaShark Tech
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload, type SanitizedConfig } from 'payload';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { i18n, isValidLocale, type Locale } from '../../../config/i18n.config';
import { calculateProgress } from '@metashark/protocol-33';

const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

// ============================================================================
// APARATO PRINCIPAL: GET (Gateway Resolver)
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (IS_BUILD_ENV) {
    return NextResponse.json({ status: 'BUILD_BYPASS' });
  }

  const { key } = await params;
  const { pathname } = request.nextUrl;
  const traceId = `gw_resolve_${Date.now()}`;
  
  console.group(`[HEIMDALL][GATEWAY] Dynamic Resolution: ${key} | Trace: ${traceId}`);

  try {
    const segments = pathname.split('/').filter(Boolean);
    const localePrefix = isValidLocale(segments[0]) ? segments[0] as Locale : i18n.defaultLocale;

    // 1. CARGA DINÁMICA Y ASÍNCRONA (AWAIT NECESARIO)
    const configModule = await import('@metashark/cms-core/config');
    const payloadConfig = await configModule.default as SanitizedConfig;

    // 2. HANDSHAKE PARALELO
    const [payload, userAuth] = await Promise.all([
      getPayload({ config: payloadConfig }),
      resolveSovereignIdentity(payloadConfig)
    ]);

    /**
     * @fix TS2339: Literal Type Narrowing.
     * Pasamos el literal 'dynamic-routes' directamente en lugar del union type.
     * Esto fuerza a Payload a devolver el tipo DynamicRoute exacto, 
     * exponiendo sus propiedades (fallbackUrl, conditionalRules) al compilador.
     */
    const routeConfig = await payload.find({
      collection: 'dynamic-routes',
      where: { routeKey: { equals: key } },
      limit: 1,
    });

    if (!routeConfig.docs.length) {
      return NextResponse.redirect(new URL(`/${localePrefix}`, request.url));
    }

    const config = routeConfig.docs[0];
    const brTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date());

    // El compilador ahora reconoce 'fallbackUrl' como propiedad de DynamicRoute
    let destinationPath = typeof config.fallbackUrl === 'string' ? config.fallbackUrl : '/';

    // El compilador ahora reconoce 'conditionalRules'
    if (Array.isArray(config.conditionalRules)) {
      for (const rule of config.conditionalRules) {
        const isTimeMatch = checkTimeWindow(brTime, rule.startTime as string, rule.endTime as string);
        
        // Validación robusta para NaN (Linter Compliant)
        const reqLevel = typeof rule.requiredLoyaltyLevel === 'number' 
            ? rule.requiredLoyaltyLevel 
            : Number(rule.requiredLoyaltyLevel);
        
        const isLevelMatch = (userAuth?.level ?? 0) >= (isNaN(reqLevel) ? 0 : reqLevel);

        if (isTimeMatch && isLevelMatch && typeof rule.destinationUrl === 'string') {
          destinationPath = rule.destinationUrl;
          break;
        }
      }
    }

    const cleanPath = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`;
    const finalUrl = new URL(`/${localePrefix}${cleanPath}`, request.url);
    
    const response = NextResponse.redirect(finalUrl, 307);
    response.headers.set('X-Enterprise-Gateway', 'Orchestrated_v4');
    return response;

  } catch (error: unknown) {
    console.error(`[CRITICAL] Engine failure: ${error instanceof Error ? error.message : 'Gateway Drift'}`);
    return NextResponse.redirect(new URL('/', request.url));
  } finally {
    console.groupEnd();
  }
}

// ============================================================================
// HELPERS SOBERANOS
// ============================================================================

async function resolveSovereignIdentity(payloadConfig: SanitizedConfig) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll() { return cookieStore.getAll(); } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const payload = await getPayload({ config: payloadConfig });
    
    /**
     * @fix Literal Type Narrowing
     * Forzamos la colección 'users' para obtener acceso a experiencePoints.
     */
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email ?? '' } },
      limit: 1,
      depth: 0
    });

    const profile = docs[0];
    if (!profile) return null;

    // TypeScript ahora sabe que profile es un User
    const xp = typeof profile.experiencePoints === 'number' ? profile.experiencePoints : 0;
    const progress = calculateProgress(xp);

    return { level: progress.currentLevel };
  } catch {
    return null;
  }
}

function checkTimeWindow(current: string, start?: string | null, end?: string | null): boolean {
  if (!start || !end) return true;
  return current >= start && current <= end;
}