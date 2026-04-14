/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador Soberano de Tráfico de Borde (Edge Orchestrator).
 *              Optimizado para Next.js 15 y Vercel Edge Network.
 * 
 * @version 28.0 - Direct Flow Optimization & Forensic Telemetry
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
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
 * PREFIJOS EXCLUIDOS (Rutas de infraestructura y activos)
 */
const EXCLUDED_PREFIXES = [
  '/_next', '/api', '/_payload', '/static', '/images', '/video', 
  '/audio', '/fonts', '/icons', '/favicon.ico', '/robots.txt', 
  '/sitemap.xml', '/manifest.json', '/auth'
];

/**
 * Regex para detección de archivos físicos (extensiones).
 */
const HAS_EXTENSION = /\.[a-z0-9]+$/i;

/**
 * MODULE: getPreferredLocale
 * Negocia el idioma basado en Cookies (Persistencia) o Headers (Preferencia de Navegador).
 */
function getPreferredLocale(request: NextRequest, traceId: string): Locale {
  // 1. Prioridad: Cookie persistente
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale as Locale;

  // 2. Fallback: Negociación por cabecera Accept-Language
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0];
    const matched = i18n.locales.find(l => l.startsWith(preferred));
    if (matched) {
      console.info(`${C.cyan}[DNA][I18N]${C.reset} Resolved via Browser: ${matched} | Trace: ${traceId}`);
      return matched as Locale;
    }
  }

  // 3. Fallback Final: Idioma por defecto (pt-BR)
  return i18n.defaultLocale;
}

/**
 * APARATO PRINCIPAL: middleware
 */
export async function middleware(request: NextRequest) {
  const start = performance.now();
  const traceId = `edge_pulse_${Date.now().toString(36).toUpperCase()}`;
  const { pathname, search } = request.nextUrl;

  // I. BYPASS DE ACTIVOS (Optimización de latencia)
  if (
    EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    HAS_EXTENSION.test(pathname)
  ) {
    return NextResponse.next();
  }

  console.group(`${C.magenta}${C.bold}[DNA][EDGE]${C.reset} Incoming Request | Trace: ${traceId}`);
  
  try {
    // II. REDIRECCIÓN DE RAÍZ SOBERANA
    // Gracias a app/page.tsx, esto es ahora un segundo nivel de seguridad.
    if (pathname === '/') {
      const locale = getPreferredLocale(request, traceId);
      const redirectUrl = new URL(`/${locale}${search}`, request.url);
      
      console.info(`${C.green}   → [REDIRECT]${C.reset} Root node targeted to: /${locale}`);
      console.groupEnd();
      
      const response = NextResponse.redirect(redirectUrl, 307);
      response.headers.set('Cache-Control', 'no-store, max-age=0'); // Vital para no cachear rumbos antiguos
      return response;
    }

    // III. NORMALIZACIÓN DE SEGMENTOS I18N
    const segments = pathname.split('/').filter(Boolean);
    const potentialLocale = segments[0];

    if (!isValidLocale(potentialLocale)) {
      const locale = getPreferredLocale(request, traceId);
      const redirectUrl = new URL(`/${locale}${pathname}${search}`, request.url);
      
      console.info(`${C.yellow}   → [RE-ROUTE]${C.reset} Invalid locale segment: /${potentialLocale} -> /${locale}`);
      console.groupEnd();
      
      const response = NextResponse.redirect(redirectUrl, 307);
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      return response;
    }

    // IV. GUARDIÁN DE AUTORIDAD (RBAC)
    const guardResponse = await routeGuard(request, potentialLocale as Locale);
    if (guardResponse) {
      console.info(`${C.yellow}   → [GUARD] INTERCEPTED`);
      console.groupEnd();
      return guardResponse;
    }

    // V. CONCESIÓN DE PASAJE
    const response = NextResponse.next();
    const duration = (performance.now() - start).toFixed(2);

    // Inyección de Telemetría en Cabeceras
    response.headers.set('X-Heimdall-Trace', traceId);
    response.headers.set('X-Edge-Latency', `${duration}ms`);
    
    console.info(`${C.green}   ✓ [GRANTED]${C.reset} Trace: ${traceId} | Latency: ${duration}ms`);
    console.groupEnd();
    return response;

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown Edge Drift';
    console.error(`\n${C.red}${C.bold}✖ [CRITICAL][EDGE] Middleware Aborted:${C.reset} ${msg}`);
    console.groupEnd();

    return NextResponse.next(); // Fallback a Next para no matar la app
  }
}

/**
 * CONFIGURACIÓN DEL MATCHER
 * Se excluyen las rutas de administración y los payloads de datos para evitar colisiones.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json|admin|_payload).*)',
  ],
};