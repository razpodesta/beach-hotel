/**
 * @file middleware.ts
 * @description Enterprise Edge Traffic Orchestrator for MetaShark Ecosystem.
 *              Refactorizado: Motor de negociación de idioma O(n) ligero,
 *              prevención estricta de "Double Slash" (404 Fix) y priorización
 *              de persistencia (Cookies > Browser Headers > Default).
 * @version 18.0 - Native Negotiation & Anti-404 Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * INFRASTRUCTURE CONTRACTS
 * @pilar V: Monorepo architectural adherence.
 */
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * SYSTEM SEGMENT EXCLUSIONS (SSoT)
 * @description Static assets and internal API prefixes.
 */
const SYSTEM_PREFIXES = [
  '/_next', '/api', '/admin', '/_payload', '/static', 
  '/images', '/video', '/audio', '/fonts', '/icons'
];

/**
 * ENTERPRISE GATEWAYS
 * @description Prefixes handled by the Dynamic Routing Manager.
 */
const GATEWAY_PREFIXES = ['/r/'];

/**
 * MOTOR DE NEGOCIACIÓN DE IDIOMA LIGERO (Edge Optimized)
 * @description Infiere el idioma ideal sin dependencias pesadas (cero 'negotiator').
 *              1. Cookie guardada.
 *              2. Cabecera 'Accept-Language' del navegador.
 *              3. Idioma por defecto (Fallback).
 */
function resolvePreferredLocale(request: NextRequest): Locale {
  // 1. Verificación de Persistencia (Cookie)
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 2. Análisis de Cabecera (Browser Priority)
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferredLocales = acceptLang
      .split(',')
      .map((lang) => {
        const [code, q] = lang.split(';q=');
        return { code: code.trim(), q: q ? parseFloat(q) : 1.0 };
      })
      .sort((a, b) => b.q - a.q); // Orden descendente por peso (calidad)

    for (const { code } of preferredLocales) {
      // Coincidencia exacta (ej: en-US)
      if (isValidLocale(code)) return code as Locale;
      
      // Coincidencia de prefijo (ej: si pide 'es-MX', servimos 'es-ES')
      const baseLang = code.split('-')[0];
      const matchedBase = i18n.locales.find((l) => l.startsWith(baseLang));
      if (matchedBase) return matchedBase as Locale;
    }
  }

  // 3. Fallback Soberano
  return i18n.defaultLocale;
}

/**
 * APARATO PRINCIPAL: middleware
 * @description Edge-side request processing for high-performance orchestration.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. FAST-PATH: STATIC ASSET FILTERING
  // @pilar X: Performance. Bypassing logic for binary streams and metadata.
  if (
    SYSTEM_PREFIXES.some((path) => pathname.startsWith(path)) ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. ENTERPRISE GATEWAY RESOLUTION (Smart QR)
  if (GATEWAY_PREFIXES.some((path) => pathname.startsWith(path))) {
    console.log(`[HEIMDALL][GATEWAY] Intercepting Dynamic Route: ${pathname}`);
    return NextResponse.next();
  }

  // 3. LOCALE HANDSHAKE (O(1) Detection & Anti-404)
  const segments = pathname.split('/');
  const activeLocale = segments[1];
  const isLocalized = isValidLocale(activeLocale);

  if (!isLocalized) {
    const preferredLocale = resolvePreferredLocale(request);
    
    /** @pilar IV: Enterprise Telemetry */
    console.info(`[HEIMDALL][EDGE] I18N_HANDSHAKE: Negotiated locale -> ${preferredLocale}`);

    /**
     * URL NORMALIZATION (Anti-Double-Slash)
     * Sanitizamos la ruta para evitar que Vercel genere 404 por múltiples diagonales.
     */
    const cleanPath = pathname === '/' ? '' : pathname.replace(/\/+$/, ''); // Remueve trailing slashes
    const redirectUrl = new URL(
      `/${preferredLocale}${cleanPath}${search}`, 
      request.url
    );
    
    return NextResponse.redirect(redirectUrl);
  }

  // 4. SECURITY AUDIT (RBAC Gating)
  // Delega la validación de identidad y permisos al guardián especializado.
  const guardResponse = await routeGuard(request, activeLocale as Locale);
  
  if (guardResponse) {
    return guardResponse;
  }

  // 5. RESPONSE FINALIZATION
  const response = NextResponse.next();
  
  /**
   * INFRASTRUCTURE HEADERS
   * X-Enterprise-Edge: Confirmación de procesamiento de capa perimetral.
   * X-Locale-Active: Inyección de consistencia para el cliente.
   */
  response.headers.set('X-Enterprise-Edge', 'Orchestrated_v18');
  response.headers.set('X-Locale-Active', activeLocale);
  
  return response;
}

/**
 * EDGE MATCHER CONFIGURATION
 * @description High-performance filter to minimize Edge Function execution.
 */
export const config = {
  matcher: [
    /**
     * Excluye archivos del sistema y recursos internos de Next.js para
     * ahorrar Unidades de Ejecución en Vercel (Edge Compute).
     */
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|icons|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};