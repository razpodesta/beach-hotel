/**
 * @file apps/portfolio-web/src/app/r/[key]/route.ts
 * @description Enterprise Routing Engine (Dynamic Gateway Resolver).
 *              Orquesta la redirección programable basada en contexto horario, 
 *              niveles de reputación y reglas de negocio configuradas en el CMS.
 * @version 2.0 - Linter Pure & Fail-Fast Hardening
 * @author Staff Engineer - MetaShark Tech
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * @interface RoutingContext
 * @description Variables de entorno y usuario para la toma de decisiones.
 */
interface RoutingContext {
  currentTime: string; // Formato HH:MM
  userLevel: number;
}

/**
 * APARATO PRINCIPAL: GET
 * @description Punto de entrada para el prefijo de gateway /r/[key].
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const traceId = `route_resolve_${Date.now()}`;
  
  console.group(`[SYSTEM][GATEWAY] Processing Dynamic Route: ${key} | ID: ${traceId}`);

  try {
    // 1. INICIALIZACIÓN DEL MOTOR DE DATOS
    const payload = await getPayload({ config: await configPromise });

    // 2. RECUPERACIÓN DE LA CONFIGURACIÓN DE RUTA
    // @fix ESLint (no-explicit-any): Casting seguro a CollectionSlug
    const TARGET_COLLECTION = 'dynamic-routes' as CollectionSlug;

    const routeConfig = await payload.find({
      collection: TARGET_COLLECTION,
      where: { routeKey: { equals: key } },
      limit: 1,
    });

    if (!routeConfig.docs.length) {
      console.warn(`[WARN] Unregistered route key: ${key}. Evacuating to Home.`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    const config = routeConfig.docs[0];

    // 3. EXTRACCIÓN DE CONTEXTO (Time & Identity)
    const now = new Date();
    // Ajuste de hora según el huso horario de Florianópolis (UTC-3)
    const brTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    // Recuperación de identidad para validación de Gating
    const userLevel = await resolveUserLevel();
    
    const context: RoutingContext = {
      currentTime: brTime,
      userLevel,
    };

    console.log(`[CONTEXT] Time: ${context.currentTime} | Reputation_Level: ${context.userLevel}`);

    // 4. MOTOR DE INFERENCIA (Rule Evaluation)
    let destination = typeof config.fallbackUrl === 'string' ? config.fallbackUrl : '/';

    if (Array.isArray(config.conditionalRules) && config.conditionalRules.length > 0) {
      for (const rule of config.conditionalRules) {
        const isTimeMatch = checkTimeWindow(context.currentTime, rule.startTime, rule.endTime);
        const isLevelMatch = context.userLevel >= (rule.requiredLoyaltyLevel ?? 0);

        if (isTimeMatch && isLevelMatch && typeof rule.destinationUrl === 'string') {
          console.log(`[MATCH] Rule found: Redirecting to ${rule.destinationUrl}`);
          destination = rule.destinationUrl;
          break; // Prioridad por orden de inserción en el CMS
        }
      }
    }

    // 5. DESPACHO DE REDIRECCIÓN (307 - Temporary Redirect)
    // Usamos 307 para evitar que el navegador cachee la ruta y permita cambios dinámicos.
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.headers.set('X-Enterprise-Route-Match', 'Contextual');
    
    return response;

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Routing Engine Drift';
    console.error(`[CRITICAL] Gateway Resolver failed: ${msg}`);
    return NextResponse.redirect(new URL('/', request.url));
  } finally {
    console.groupEnd();
  }
}

/**
 * HELPER: checkTimeWindow
 * @description Lógica de comparación de strings horarios.
 */
function checkTimeWindow(current: string, start?: string, end?: string): boolean {
  if (!start || !end) return true; // Si no hay restricción horaria, es un match.
  return current >= start && current <= end;
}

/**
 * HELPER: resolveUserLevel
 * @description Handshake con Supabase y CMS para obtener el rango del Protocolo 33.
 */
async function resolveUserLevel(): Promise<number> {
  try {
    // @fix ESLint (no-non-null-assertion): Validación estricta Fail-Fast
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[HEIMDALL][GATEWAY] Env vars missing. Defaulting to Guest Level.');
      return 0;
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll() { return cookieStore.getAll(); } }
    });

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return 0;

    const payload = await getPayload({ config: await configPromise });
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email ?? '' } },
      limit: 1,
    });

    const targetUser = docs[0];
    
    // Verificamos si la propiedad experiencePoints existe en el documento devuelto
    if (targetUser && typeof targetUser === 'object' && 'experiencePoints' in targetUser) {
      return (targetUser.experiencePoints as number) ?? 0;
    }

    return 0;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Handshake Error';
    console.warn(`[HEIMDALL][GATEWAY] Reputation sync failed: ${msg}`);
    return 0; // Fallback seguro a nivel Iniciado
  }
}