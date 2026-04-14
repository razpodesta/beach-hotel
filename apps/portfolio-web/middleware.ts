/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador Soberano de Tráfico de Borde (Edge Orchestrator).
 *              Refactorizado: Arquitectura SEO-First para negociación de idiomas.
 *              Nivelado: Telemetría Verbosa Heimdall v2.5 (Lint Pure).
 *              Sincronizado: Inyección de cabeceras de auditoría y protección Regex
 *              contra tormentas de 404s en recursos estáticos.
 * 
 * @version 27.0 - Static Extension Gating & Forensic Telemetry
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

const EXCLUDED_PREFIXES =[
  '/_next', '/api', '/_payload', '/static', '/images', '/video', 
  '/audio', '/fonts', '/icons', '/favicon.ico', '/robots.txt', 
  '/sitemap.xml', '/manifest.json', '/auth', '/r/'
];

/**
 * @constant HAS_EXTENSION
 * @description Patrón Regex para detectar si la ruta solicita un archivo físico (ej: .png, .xml).
 * @pilar VIII: Resiliencia - Evita que el middleware intente inyectar idiomas en archivos estáticos.
 */
const HAS_EXTENSION = /\.[a-z0-9]+$/i;

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
      /** @fix: console.log -> console.info para cumplimiento Linter v10.0 */
      console.info(`${C.cyan}[DNA][I18N]${C.reset} Locale resolved via Browser: ${matched} | Trace: ${traceId}`);
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
  const traceId = `edge_pulse_${Date.now().toString(36).toUpperCase()}`;
  const { pathname, search } = request.nextUrl;

  // I. BYPASS DE ACTIVOS E INFRAESTRUCTRURA (Optimización de latencia)
  // Se evalúan prefijos excluidos Y extensiones de archivo estáticas
  if (
    EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    HAS_EXTENSION.test(pathname)
  ) {
    return NextResponse.next();
  }

  /**
   * PROTOCOLO HEIMDALL: Inicio de Escrutinio
   * @pilar IV: Trazabilidad forense mediante grupos de consola.
   */
  console.group(`${C.magenta}${C.bold}[DNA][EDGE]${C.reset} Incoming Request | Trace: ${traceId}`);
  console.info(`Path: ${pathname} | Method: ${request.method}`);

  try {
    // II. REDIRECCIÓN DE RAÍZ SOBERANA (SEO Root Fix)
    if (pathname === '/') {
      const locale = getPreferredLocale(request, traceId);
      
      /** @fix: console.log -> console.info */
      console.info(`${C.green}   →[REDIRECT]${C.reset} Root node found. Targeted to: /${locale}`);
      
      const redirectUrl = new URL(`/${locale}${search}`, request.url);
      const response = NextResponse.redirect(redirectUrl, 307);
      
      // @pilar VIII: Previene el envenenamiento de caché (Edge Poisoning)
      response.headers.set('Cache-Control', 's-maxage=0, stale-while-revalidate');
      console.groupEnd();
      return response;
    }

    // III. ORQUESTACIÓN DE IDIOMA Y CORRECCIÓN DE RUMBOS
    const segments = pathname.split('/').filter(Boolean);
    const currentLocale = segments[0];

    if (!isValidLocale(currentLocale)) {
      const locale = getPreferredLocale(request, traceId);
      const redirectUrl = new URL(`/${locale}${pathname}${search}`, request.url);
      
      /** @fix: console.log -> console.info */
      console.info(`${C.yellow}   → [RE-ROUTE]${C.reset} Invalid segment corrected: /${currentLocale} -> /${locale}`);
      
      const response = NextResponse.redirect(redirectUrl, 307);
      response.headers.set('Cache-Control', 's-maxage=0, stale-while-revalidate');
      console.groupEnd();
      return response;
    }

    // IV. HANDSHAKE DE SEGURIDAD (RBAC Gating)
    const guardResponse = await routeGuard(request, currentLocale as Locale);
    if (guardResponse) {
      console.info(`${C.yellow}   → [GUARD] Traffic intercepted by Security Node.`);
      console.groupEnd();
      return guardResponse;
    }

    // V. SELLO DE RESPUESTA SOBERANA (Pasaje Permitido)
    const response = NextResponse.next();
    const duration = (performance.now() - start).toFixed(2);

    response.headers.set('X-Heimdall-Trace', traceId);
    response.headers.set('X-Edge-Latency', `${duration}ms`);
    response.headers.set('X-Enterprise-Orchestrator', 'v27.0-Forensic');

    console.info(`${C.green}   ✓ [GRANTED]${C.reset} Clearance verified | Latency: ${duration}ms`);
    console.groupEnd();
    return response;

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown Edge Drift';
    
    /** @fix: console.error con contexto técnico */
    console.error(`\n${C.red}${C.bold}✖ [CRITICAL][EDGE] Middleware Aborted:${C.reset}`);
    console.error(`   ↳ Motivo: ${msg}`);
    console.error(`   ↳ Trace: ${traceId}\n`);
    
    console.groupEnd();

    // Fail-Safe: Mantenemos el portal online con estado degradado
    const fallbackResponse = NextResponse.next();
    fallbackResponse.headers.set('X-Edge-Status', 'Degraded');
    return fallbackResponse;
  }
}

export const config = {
  matcher:['/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json|admin|_payload).*)'],
};