/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador soberano de tráfico en el Edge. 
 *              Gestiona i18n, Seguridad RBAC y blindaje de infraestructura CMS.
 * @version 11.1 - Clean Catch Edition (ESLint Compliant)
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * CONFIGURACIÓN DE INFRAESTRUCTRURA
 */
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_KEY = process.env.BYPASS_MAINTENANCE_KEY;

// Extensiones estáticas que eluden el procesamiento de middleware por performance.
const PUBLIC_FILE_REGEX = /\.(.*)$/;

// Rutas de sistema que deben ser ignoradas por la negociación de i18n.
const SYSTEM_PATHS = [
  '/_next', 
  '/api', 
  '/admin', 
  '/static', 
  '/images', 
  '/fonts', 
  '/audio',
  '/_payload' // @pilar I: Soporte nativo para activos internos de Payload 3.0
];

/**
 * MOTOR DE NEGOCIACIÓN DE IDIOMA (Heimdall Protocol)
 * @pilar III: Seguridad de Tipos Absoluta.
 * Determina el idioma óptimo analizando cookies y cabeceras del navegador.
 */
function getPreferredLocale(request: NextRequest): Locale {
  const traceId = `LOCALE-AUTH-${Date.now()}`;
  
  // 1. Prioridad: Persistencia en Cookie (Preferencia del Usuario)
  const localeCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // 2. Heurística: Análisis de cabeceras de navegación
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages, [...i18n.locales], i18n.defaultLocale) as Locale;
  } catch {
    /**
     * @pilar X: Higiene de Código.
     * Se utiliza 'Optional Catch Binding' eliminando la variable 'error' no utilizada.
     * @pilar IV: Logging forense de rescate hacia el locale soberano (pt-BR).
     */
    console.warn(`[HEIMDALL][${traceId}] Fallo en negociación de idioma. Ejecutando rescate tipográfico.`);
    return i18n.defaultLocale;
  }
}

/**
 * INTERCEPTOR DE TRÁFICO SOBERANO
 * @param {NextRequest} request - Solicitud entrante interceptada en el Edge.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const traceId = `EDGE-${Date.now()}`;

  // --- 1. BLINDAJE TÉCNICO (Bypass) ---
  const isSystemPath = SYSTEM_PATHS.some((path) => pathname.startsWith(path));
  if (isSystemPath || PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // --- 2. PROTOCOLO DE MANTENIMIENTO (Kill Switch) ---
  if (MAINTENANCE_MODE) {
    const bypassCookie = request.cookies.get('maintenance_bypass');
    if (bypassCookie?.value !== BYPASS_KEY && !pathname.includes('/maintenance')) {
      const locale = getPreferredLocale(request);
      console.log(`[HEIMDALL][${traceId}] Acceso bloqueado: Modo Mantenimiento Activo.`);
      return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
    }
  }

  // --- 3. ORQUESTACIÓN I18N ---
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getPreferredLocale(request);
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    
    // Redirección 307 (Temporal) para preservar SEO y la intención del usuario
    return NextResponse.redirect(
      new URL(`/${locale}${normalizedPath}${search}`, request.url)
    );
  }

  // Identificación del locale presente en el segmento de ruta
  const localeInPath = i18n.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) as Locale;

  const response = NextResponse.next();

  // --- 4. PERSISTENCIA INTELIGENTE ---
  // @pilar X: Rendimiento. Solo escribimos la cookie si el valor ha cambiado.
  const currentCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeInPath && currentCookie !== localeInPath) {
    response.cookies.set(i18n.cookieName, localeInPath, { 
      path: '/', 
      maxAge: 31536000, // 1 Año (Sovereign Lifetime)
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // --- 5. SEGURIDAD RBAC (Guardiana de Rutas) ---
  // Ejecutamos la validación final antes de entregar el control al orquestador.
  const guardResponse = routeGuard(request, localeInPath);
  if (guardResponse) return guardResponse;

  return response;
}

/**
 * CONFIGURACIÓN DEL MATCHER (Performance Edge)
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|admin).*)',
  ],
};