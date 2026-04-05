/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador Soberano de Tráfico de Borde (Edge Orchestrator).
 *              Gestiona la resolución de internacionalización (i18n), el ruteo 
 *              dinámico y el blindaje perimetral (RBAC) en el Edge de Vercel.
 *              Refactorizado: Telemetría Heimdall v2.0, resiliencia ante fallos
 *              de guardia y optimización de latencia L0.
 * @version 23.0 - Edge Resilient Standard (Heimdall v2.0 Injected)
 * @author Staff Engineer - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * CONSTANTES DE INFRAESTRUCTURA
 */
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

const EXCLUDED_PREFIXES = [
  '/_next', '/api', '/_payload', '/static', '/images', '/video', 
  '/audio', '/fonts', '/icons', '/favicon.ico', '/robots.txt', 
  '/sitemap.xml', '/manifest.json', '/auth', '/r/'
];

/**
 * MODULE: getPreferredLocale
 * @description Algoritmo de resolución de identidad lingüística (Cookie > Header > Default).
 */
function getPreferredLocale(request: NextRequest, traceId: string): Locale {
  // 1. Prioridad: Cookie persistida
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  // 2. Secundario: Preferencia del navegador
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0];
    const matched = i18n.locales.find(l => l.startsWith(preferred));
    if (matched) {
      console.log(`${C.cyan}[DNA][I18N]${C.reset} Locale resolved via Browser: ${matched} | Trace: ${traceId}`);
      return matched as Locale;
    }
  }

  // 3. Fallback: Estándar del Santuario
  return i18n.defaultLocale;
}

/**
 * APARATO PRINCIPAL: middleware
 * @description Punto único de intercepción de tráfico.
 */
export async function middleware(request: NextRequest) {
  const start = performance.now();
  const traceId = `edge_pulse_${Date.now().toString(36)}`;
  const { pathname } = request.nextUrl;

  try {
    // I. BYPASS DE ACTIVOS (Optimización de Latencia)
    // Evita procesar lógica para archivos estáticos o recursos de infraestructura.
    if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    // II. ORQUESTACIÓN DE IDIOMA
    const segments = pathname.split('/').filter(Boolean);
    const currentLocale = segments[0];

    if (!isValidLocale(currentLocale)) {
      const locale = getPreferredLocale(request, traceId);
      const redirectUrl = new URL(
        `/${locale}${pathname === '/' ? '' : pathname}`, 
        request.url
      );

      // Copiamos los parámetros de búsqueda para no perder el contexto (UTMs, Auth signals)
      request.nextUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
      });

      console.log(`${C.yellow}[DNA][EDGE]${C.reset} Redirecting to Locale: ${locale} | Path: ${pathname}`);
      return NextResponse.redirect(redirectUrl);
    }

    // III. HANDSHAKE DE SEGURIDAD (RBAC Gating)
    /**
     * @pilar VIII: Resiliencia de Borde.
     * El routeGuard ha sido refactorizado para ser ultra-ligero y retornar nulo 
     * si no hay intercepción requerida.
     */
    const guardResponse = await routeGuard(request, currentLocale as Locale);
    
    if (guardResponse) {
      // El guardián ha decidido una redirección (ej: Auth requerida)
      return guardResponse;
    }

    // IV. SELLO DE RESPUESTA SOBERANA
    const response = NextResponse.next();
    const duration = (performance.now() - start).toFixed(2);

    // Inyectamos cabeceras de observabilidad para el Visitor HUD (Fase 4)
    response.headers.set('X-Heimdall-Trace', traceId);
    response.headers.set('X-Edge-Latency', `${duration}ms`);
    response.headers.set('X-Enterprise-Orchestrator', 'v23.0-Stable');

    return response;

  } catch (error: unknown) {
    /**
     * @pilar VIII: Guardia de Pánico (Fail-Safe).
     * Si el middleware falla por un error inesperado, permitimos que el tráfico 
     * fluya hacia Next.js para no dejar al hotel offline, pero reportamos la anomalía.
     */
    const msg = error instanceof Error ? error.message : 'Unknown Edge Drift';
    console.error(`${C.red}${C.bold}[CRITICAL][EDGE] Middleware Aborted:${C.reset} ${msg}`);
    
    const fallbackResponse = NextResponse.next();
    fallbackResponse.headers.set('X-Edge-Status', 'Degraded');
    fallbackResponse.headers.set('X-Edge-Error', 'RECOVERY_BYPASS');
    
    return fallbackResponse;
  }
}

/**
 * CONFIGURACIÓN DE COBERTURA
 * @description Define el perímetro de acción del middleware evitando colisiones con APIs.
 */
export const config = {
  matcher: [
    /**
     * Excluimos explícitamente rutas que no deben ser interceptadas por el motor de i18n
     * para ahorrar ciclos de cómputo en Vercel.
     */
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json|admin|_payload).*)'
  ],
};