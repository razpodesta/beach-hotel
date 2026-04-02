/**
 * @file route.ts
 * @description Enterprise Routing Engine (Dynamic Gateway Resolver v3.0).
 *              Orquesta la redirección programable basada en contexto horario, 
 *              identidad del huésped (P33) y soberanía de idioma (i18n).
 * @version 3.0 - I18n Aware & Parallel Handshake
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA 
 * @pilar_V: Adherencia al Grafo Soberano.
 */
import { i18n, isValidLocale, type Locale } from '../../../config/i18n.config';
import { calculateProgress } from '@metashark/protocol-33';

/**
 * APARATO PRINCIPAL: GET (Gateway Resolver)
 * @description Punto de entrada para el despacho de rumbos dinámicos.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const { pathname } = request.nextUrl;
  const traceId = `gw_resolve_${Date.now()}`;
  
  console.group(`[HEIMDALL][GATEWAY] Dynamic Resolution: ${key} | Trace: ${traceId}`);

  try {
    // 1. DETECCIÓN DE CONTEXTO DE IDIOMA (I18n Awareness)
    // Extraemos el locale del path si existe, de lo contrario usamos el default
    const segments = pathname.split('/').filter(Boolean);
    const localePrefix = isValidLocale(segments[0]) ? segments[0] as Locale : i18n.defaultLocale;

    // 2. HANDSHAKE PARALELO (Pilar X: Performance)
    // Inicializamos CMS y recuperamos identidad de forma concurrente
    const [payload, userAuth] = await Promise.all([
      getPayload({ config: await configPromise }),
      resolveSovereignIdentity()
    ]);

    // 3. RECUPERACIÓN DE CONFIGURACIÓN (Silo D)
    const TARGET_COLLECTION = 'dynamic-routes' as CollectionSlug;
    const routeConfig = await payload.find({
      collection: TARGET_COLLECTION,
      where: { routeKey: { equals: key } },
      limit: 1,
    });

    if (!routeConfig.docs.length) {
      console.warn(`[WARN] Unregistered route: ${key}. Evacuating to Sanctuary Home.`);
      return NextResponse.redirect(new URL(`/${localePrefix}`, request.url));
    }

    const config = routeConfig.docs[0];

    // 4. EXTRACCIÓN DE CONTEXTO HORARIO (Time-Gating)
    const brTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date());

    // 5. MOTOR DE INFERENCIA (Rule Evaluation)
    let destinationPath = typeof config.fallbackUrl === 'string' ? config.fallbackUrl : '/';

    if (Array.isArray(config.conditionalRules)) {
      for (const rule of config.conditionalRules) {
        const isTimeMatch = checkTimeWindow(brTime, rule.startTime, rule.endTime);
        const isLevelMatch = (userAuth?.level ?? 0) >= (rule.requiredLoyaltyLevel ?? 0);

        if (isTimeMatch && isLevelMatch && typeof rule.destinationUrl === 'string') {
          console.log(`[MATCH] Rule Triggered: ${rule.destinationUrl} | Reason: Time/Level Hierarchy`);
          destinationPath = rule.destinationUrl;
          break; // Prioridad determinista por orden en CMS
        }
      }
    }

    // 6. NORMALIZACIÓN DE RUTA FINAL (Anti-404)
    // Aseguramos que el destino incluya el locale y no duplique barras
    const cleanPath = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`;
    const finalUrl = new URL(`/${localePrefix}${cleanPath}`, request.url);
    
    console.log(`[SUCCESS] Dispatching to: ${finalUrl.pathname}`);
    
    const response = NextResponse.redirect(finalUrl, 307);
    response.headers.set('X-Enterprise-Gateway', 'Orchestrated_v3');
    response.headers.set('X-Trace-ID', traceId);
    
    return response;

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gateway Drift';
    console.error(`[CRITICAL] Engine failure: ${msg}`);
    return NextResponse.redirect(new URL('/', request.url));
  } finally {
    console.groupEnd();
  }
}

/**
 * HELPER: resolveSovereignIdentity
 * @description Sincroniza Supabase y CMS para obtener el nivel del Protocolo 33.
 */
async function resolveSovereignIdentity(): Promise<{ level: number } | null> {
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

    const payload = await getPayload({ config: await configPromise });
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email ?? '' } },
      limit: 1,
    });

    const profile = docs[0];
    if (!profile) return null;

    // Utilizamos el motor P33 central para obtener el nivel real basado en XP
    const xp = typeof profile.experiencePoints === 'number' ? profile.experiencePoints : 0;
    const progress = calculateProgress(xp);

    return { level: progress.currentLevel };
  } catch {
    return null;
  }
}

/**
 * HELPER: checkTimeWindow
 * @description Lógica de comparación de strings horarios ISO (HH:MM).
 */
function checkTimeWindow(current: string, start?: string | null, end?: string | null): boolean {
  if (!start || !end) return true;
  return current >= start && current <= end;
}