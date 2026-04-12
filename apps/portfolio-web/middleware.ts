/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador Soberano de Tráfico de Borde (Edge Orchestrator).
 *              Refactorizado: Arquitectura SEO-First para negociación de idiomas.
 *              Intercepta la raíz absoluta (/) y redirige de forma segura (HTTP 307)
 *              al locale correspondiente, eliminando la necesidad de un Root Layout.
 *              Inyecta cabeceras Anti-Caché (Edge Cache Poisoning Prevention).
 * @version 25.0 - SEO Edge Gateway & Linter Pure
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 * @pilar III: Contrato de tipo explícito para erradicar TS2339.
 */
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
} as const;

const EXCLUDED_PREFIXES = [
  '/_next', '/api', '/_payload', '/static', '/images', '/video', 
  '/audio', '/fonts', '/icons', '/favicon.ico', '/robots.txt', 
  '/sitemap.xml', '/manifest.json', '/auth', '/r/'
];

/**
 * MODULE: getPreferredLocale
 * @description Negocia el idioma basado en la identidad de sesión (Cookies) 
 *              o la firma del navegador (Headers), con fallback seguro para bots.
 */
function getPreferredLocale(request: NextRequest, traceId: string): Locale {
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale as Locale;

  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0];
    const matched = i18n.locales.find(l => l.startsWith(preferred));
    if (matched) {
      console.log(`${C.cyan}[DNA][I18N]${C.reset} Locale resolved via Browser: ${matched} | Trace: ${traceId}`);
      return matched as Locale;
    }
  }
  return i18n.defaultLocale;
}

/**
 * APARATO PRINCIPAL: middleware
 * @description Centinela de borde. Orquesta el tráfico antes de tocar el servidor de origen.
 */
export async function middleware(request: NextRequest) {
  const start = performance.now();
  const traceId = `edge_pulse_${Date.now().toString(36)}`;
  const { pathname, search } = request.nextUrl;

  try {
    // I. BYPASS DE ACTIVOS E INFRAESTRUCTURA
    if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    // II. REDIRECCIÓN DE RAÍZ SOBERANA (SEO Root Fix)
    // Previene el 404 inyectando un HTTP 307 hacia el idioma correspondiente.
    if (pathname === '/') {
      const locale = getPreferredLocale(request, traceId);
      console.log(`${C.magenta}[DNA][EDGE]${C.reset} Root redirect to: /${locale} | Trace: ${traceId}`);
      
      const redirectUrl = new URL(`/${locale}${search}`, request.url);
      const response = NextResponse.redirect(redirectUrl, 307);
      
      // @pilar VIII: Previene que Vercel Edge cachee la redirección para otros usuarios
      response.headers.set('Cache-Control', 's-maxage=0, stale-while-revalidate');
      return response;
    }

    // III. ORQUESTACIÓN DE IDIOMA Y CORRECCIÓN DE RUMBOS
    const segments = pathname.split('/').filter(Boolean);
    const currentLocale = segments[0];

    if (!isValidLocale(currentLocale)) {
      const locale = getPreferredLocale(request, traceId);
      const redirectUrl = new URL(`/${locale}${pathname}${search}`, request.url);
      
      console.log(`${C.yellow}[DNA][EDGE]${C.reset} Invalid locale fixed: /${currentLocale} -> /${locale}`);
      
      const response = NextResponse.redirect(redirectUrl, 307);
      response.headers.set('Cache-Control', 's-maxage=0, stale-while-revalidate');
      return response;
    }

    // IV. HANDSHAKE DE SEGURIDAD (RBAC Gating)
    const guardResponse = await routeGuard(request, currentLocale as Locale);
    if (guardResponse) return guardResponse;

    // V. SELLO DE RESPUESTA SOBERANA
    const response = NextResponse.next();
    const duration = (performance.now() - start).toFixed(2);

    response.headers.set('X-Heimdall-Trace', traceId);
    response.headers.set('X-Edge-Latency', `${duration}ms`);
    response.headers.set('X-Enterprise-Orchestrator', 'v25.0-Stable');

    return response;

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown Edge Drift';
    console.error(`${C.red}${C.bold}[CRITICAL][EDGE] Middleware Aborted:${C.reset} ${msg}`);
    
    // Fail-Safe: No bloqueamos la aplicación por un fallo del middleware
    const fallbackResponse = NextResponse.next();
    fallbackResponse.headers.set('X-Edge-Status', 'Degraded');
    return fallbackResponse;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json|admin|_payload).*)'],
};