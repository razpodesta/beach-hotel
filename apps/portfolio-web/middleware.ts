/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador Soberano de Tráfico de Borde (Edge Gateway).
 *              Optimizado para Next.js 15 y Vercel Edge Network.
 *              Refactorizado: Erradicación de colisión de enrutamiento 404,
 *              inyección de directivas 'must-revalidate' anti-envenenamiento 
 *              de caché y Flat Logging para estabilidad del Edge Worker.
 * 
 * @version 29.0 - Vercel Edge Hardened & 404 Root Fix
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall v2.5 - Edge Safe)
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

/**
 * PREFIJOS EXCLUIDOS (Bypass de latencia cero)
 */
const EXCLUDED_PREFIXES = [
  '/_next', '/api', '/_payload', '/static', '/images', '/video', 
  '/audio', '/fonts', '/icons', '/favicon.ico', '/robots.txt', 
  '/sitemap.xml', '/manifest.json', '/auth'
];

/**
 * Regex para detección de activos físicos.
 */
const HAS_EXTENSION = /\.[a-z0-9]+$/i;

/**
 * MODULE: getPreferredLocale
 * @description Negocia el idioma (Cookie > Browser > Default).
 * @pilar X: Algoritmo defensivo contra headers malformados.
 */
function getPreferredLocale(request: NextRequest, traceId: string): Locale {
  try {
    // 1. Prioridad Absoluta: Cookie persistente de sesión
    const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
    if (cookieLocale && isValidLocale(cookieLocale)) {
      return cookieLocale as Locale;
    }

    // 2. Inteligencia de Navegador: Accept-Language
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      // Extrae 'en', 'es', 'pt' de strings complejos como 'es-ES,es;q=0.9,en;q=0.8'
      const preferred = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      const matched = i18n.locales.find(l => l.toLowerCase().startsWith(preferred));
      
      if (matched) {
        console.info(`${C.cyan}[DNA][I18N]${C.reset} Auto-resolved via Browser: ${matched} | Trace: ${traceId}`);
        return matched as Locale;
      }
    }
  } catch {
    console.warn(`${C.yellow}[DNA][I18N]${C.reset} Header parsing failed. Engaging default fallback.`);
  }

  // 3. Fallback Innegociable: Portugués de Brasil
  return i18n.defaultLocale;
}

/**
 * MODULE: safeEdgeRedirect
 * @description Construye la redirección inyectando bloqueadores de caché.
 * @pilar VIII: Resiliencia contra el Edge Cache Poisoning de Vercel CDN.
 */
function safeEdgeRedirect(url: URL): NextResponse {
  const response = NextResponse.redirect(url, 307);
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  response.headers.set('X-Edge-Routing', 'Sovereign_Bypass');
  return response;
}

/**
 * APARATO PRINCIPAL: middleware
 */
export async function middleware(request: NextRequest) {
  const start = performance.now();
  const traceId = `edge_pulse_${Date.now().toString(36).toUpperCase()}`;
  const { pathname, search } = request.nextUrl;

  // I. BYPASS DE ACTIVOS (O(1) Exit)
  if (
    EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    HAS_EXTENSION.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Edge-Safe Flat Logging
  console.info(`${C.magenta}${C.bold}[DNA][EDGE]${C.reset} Incoming Request: ${pathname} | Trace: ${traceId}`);
  
  try {
    // II. ERRADICACIÓN DEL 404 RAÍZ (Sovereign Root)
    if (pathname === '/') {
      const locale = getPreferredLocale(request, traceId);
      const redirectUrl = new URL(`/${locale}${search}`, request.url);
      
      console.info(`${C.green}   → [ROOT_REDIRECT]${C.reset} Targeted to: /${locale} | Trace: ${traceId}`);
      return safeEdgeRedirect(redirectUrl);
    }

    // III. AUTO-REPARACIÓN DE RUMBOS (Invalid Locale Detection)
    const segments = pathname.split('/').filter(Boolean);
    const potentialLocale = segments[0];

    if (!potentialLocale || !isValidLocale(potentialLocale)) {
      const locale = getPreferredLocale(request, traceId);
      // Garantiza que no se generen barras dobles '//'
      const cleanPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
      const redirectUrl = new URL(`/${locale}${cleanPathname}${search}`, request.url);
      
      console.info(`${C.yellow}   → [RE-ROUTE]${C.reset} Invalid segment -> /${locale} | Trace: ${traceId}`);
      return safeEdgeRedirect(redirectUrl);
    }

    // IV. GUARDIÁN DE AUTORIDAD (RBAC & P33)
    const guardResponse = await routeGuard(request, potentialLocale as Locale);
    if (guardResponse) {
      console.info(`${C.yellow}   → [GUARD_INTERCEPT]${C.reset} Perimeter shield engaged | Trace: ${traceId}`);
      // El routeGuard ya devuelve una respuesta sanitizada
      return guardResponse;
    }

    // V. CONCESIÓN DE PASAJE (Granted)
    const response = NextResponse.next();
    const duration = (performance.now() - start).toFixed(2);

    response.headers.set('X-Heimdall-Trace', traceId);
    response.headers.set('X-Edge-Latency', `${duration}ms`);
    
    console.info(`${C.green}   ✓ [GRANTED]${C.reset} Trace: ${traceId} | Latency: ${duration}ms`);
    
    return response;

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown Edge Drift';
    console.error(`${C.red}${C.bold}✖ [CRITICAL][EDGE] Middleware Aborted:${C.reset} ${msg} | Trace: ${traceId}`);
    // Failsafe: Permite el paso para no tumbar la aplicación
    return NextResponse.next();
  }
}

/**
 * CONFIGURACIÓN DEL MATCHER SOBERANO
 * @description Ahora incluye explícitamente '/' para forzar a Vercel a ejecutarlo
 * siempre, independientemente de la generación estática.
 */
export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json|admin|_payload).*)',
  ],
};