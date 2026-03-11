/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador soberano de tráfico en el Edge. Gestiona la negociación 
 *              de idioma (i18n), el estado de mantenimiento (Heimdall Protocol) 
 *              y el blindaje de rutas críticas del sistema y CMS.
 * @version 10.0
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

// ============================================================================
// CONFIGURACIÓN DE ENTORNO Y CONSTANTES TÉCNICAS
// ============================================================================

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_KEY = process.env.BYPASS_MAINTENANCE_KEY;

/**
 * Expresión regular para detectar recursos con extensión.
 * Optimiza el rendimiento evitando que el middleware procese assets estáticos.
 */
const PUBLIC_FILE_REGEX = /\.(.*)$/;

/**
 * Rutas del sistema que eluden la negociación de idioma.
 * Vital para el funcionamiento de Next.js Internals y Payload CMS 3.0.
 */
const SYSTEM_PATHS = ['/_next', '/api', '/admin', '/static', '/images', '/fonts', '/audio'];

// ============================================================================
// NÚCLEO DE NEGOCIACIÓN DE IDIOMA
// ============================================================================

/**
 * Determina el locale óptimo para la sesión actual.
 * @param {NextRequest} request - Solicitud entrante.
 * @returns {Locale} El código de idioma validado (Prioridad: Cookie > Header > Default).
 */
function getPreferredLocale(request: NextRequest): Locale {
  // 1. Prioridad: Preferencia guardada previamente por el usuario.
  const localeCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // 2. Negociación Heurística: Basada en las cabeceras del navegador.
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages, [...i18n.locales], i18n.defaultLocale) as Locale;
  } catch {
    /**
     * CORRECCIÓN LINT: Se elimina la variable 'error' no utilizada.
     * Rescate hacia el idioma soberano del hotel (pt-BR).
     */
    return i18n.defaultLocale;
  }
}

// ============================================================================
// MIDDLEWARE SOBERANO
// ============================================================================

/**
 * Interceptor de tráfico Next.js 15.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. BLINDAJE TÉCNICO: Bypass para activos estáticos y rutas de sistema.
  const isSystemPath = SYSTEM_PATHS.some((path) => pathname.startsWith(path));
  if (isSystemPath || PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // 2. PROTOCOLO MANTENIMIENTO: Kill Switch de alta disponibilidad.
  if (MAINTENANCE_MODE) {
    const bypassCookie = request.cookies.get('maintenance_bypass');
    if (bypassCookie?.value !== BYPASS_KEY && !pathname.includes('/maintenance')) {
      const locale = getPreferredLocale(request);
      return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
    }
  }

  // 3. ENRUTAMIENTO I18N: Verificación de prefijo localized.
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getPreferredLocale(request);
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    
    // Redirección 307 para preservar la intención del usuario.
    return NextResponse.redirect(
      new URL(`/${locale}${normalizedPath}${search}`, request.url)
    );
  }

  // Identificación del locale presente en la ruta.
  const localeInPath = i18n.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) as Locale;

  const response = NextResponse.next();

  // 4. PERSISTENCIA: Sincronización de la elección de idioma.
  const currentCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeInPath && currentCookie !== localeInPath) {
    response.cookies.set(i18n.cookieName, localeInPath, { 
      path: '/', 
      maxAge: 31536000, // 1 Año.
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // 5. SEGURIDAD RBAC: Validación mediante el Guardián de Rutas.
  const guardResponse = routeGuard(request, localeInPath);
  if (guardResponse) return guardResponse;

  return response;
}

// ============================================================================
// CONFIGURACIÓN DEL MATCHER (Performance Edge)
// ============================================================================

export const config = {
  /**
   * Se excluyen explícitamente rutas de bajo valor de procesamiento para el middleware.
   * Mejora drástica del Time to First Byte (TTFB).
   */
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|admin).*)',
  ],
};