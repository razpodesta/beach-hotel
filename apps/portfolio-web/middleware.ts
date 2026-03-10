// RUTA: apps/portfolio-web/middleware.ts

/**
 * @file Guardián y Enrutador Principal (Edge Middleware)
 * @version 8.0 - Integración Payload CMS 3.0 & Hospitality Edge
 * @description Intercepta las solicitudes en el Edge para orquestar:
 *              1. Exclusión quirúrgica de rutas críticas (Payload Admin, API, Assets).
 *              2. Negociación y redirección de internacionalización (i18n).
 *              3. Protocolo de mantenimiento de alta disponibilidad (Kill Switch).
 *              4. Control de acceso unificado mediante `routeGuard`.
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

// ============================================================================
// CONFIGURACIÓN DE ENTORNO Y CONSTANTES DE ALTO RENDIMIENTO
// ============================================================================

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_KEY = process.env.BYPASS_MAINTENANCE_KEY;

/**
 * Expresión regular para detectar archivos con extensión (ej: .png, .css).
 * Evita el procesamiento innecesario de recursos estáticos.
 */
const PUBLIC_FILE_REGEX = /\.(.*)$/;

/**
 * Rutas del sistema que DEBEN evadir la lógica de internacionalización y redirección.
 * Incluye las rutas vitales para Payload CMS 3.0 y Next.js.
 */
const SYSTEM_PATHS =['/_next', '/api', '/admin', '/static', '/images', '/fonts', '/audio'];

// ============================================================================
// UTILIDADES NÚCLEO
// ============================================================================

/**
 * Determina el idioma óptimo para la solicitud entrante.
 * Prioriza la cookie de sesión; si no existe, negocia mediante los headers del navegador.
 * 
 * @param {NextRequest} request - La solicitud HTTP entrante en el Edge.
 * @returns {Locale} El código de idioma resuelto y validado.
 */
function getPreferredLocale(request: NextRequest): Locale {
  // 1. Caché persistente: Prioridad absoluta a la elección previa del usuario.
  const localeCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // 2. Negociación heurística basada en las preferencias del navegador (Accept-Language).
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages,[...i18n.locales], i18n.defaultLocale) as Locale;
  } catch (error) {
    // Fail-safe silencioso
    return i18n.defaultLocale;
  }
}

// ============================================================================
// ORQUESTADOR PRINCIPAL (MIDDLEWARE)
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // 1. BLINDAJE DE SISTEMA Y PAYLOAD CMS (Cero Regresiones)
  // ---------------------------------------------------------------------------
  // Garantizamos que las APIs, el panel del CMS (/admin) y los assets pasen limpios.
  const isSystemPath = SYSTEM_PATHS.some((path) => pathname.startsWith(path));
  if (isSystemPath || PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 2. PROTOCOLO DE MANTENIMIENTO (Kill Switch)
  // ---------------------------------------------------------------------------
  if (MAINTENANCE_MODE) {
    const bypassCookie = request.cookies.get('maintenance_bypass');

    // Validación de acceso privilegiado
    if (bypassCookie?.value !== BYPASS_KEY && !pathname.includes('/maintenance')) {
      const locale = getPreferredLocale(request);
      return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
    }
  }

  // ---------------------------------------------------------------------------
  // 3. ENRUTAMIENTO I18N (Localización Forzada)
  // ---------------------------------------------------------------------------
  // Verificamos si la ruta actual carece de prefijo de idioma (ej: '/' en vez de '/es-ES')
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getPreferredLocale(request);
    
    // Redirección 307 (Temporary Redirect) para preservar métodos POST si los hubiera
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return NextResponse.redirect(
      new URL(`/${locale}${normalizedPath}${search}`, request.url)
    );
  }

  // Extracción segura del locale actual desde la URL (ya validado por el paso anterior)
  const localeInPath = i18n.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) as Locale;

  // ---------------------------------------------------------------------------
  // 4. SINCRONIZACIÓN DEL ESTADO GLOBAL (Cookies)
  // ---------------------------------------------------------------------------
  const response = NextResponse.next();

  // Si el usuario alteró la URL manualmente (ej: cambió /es-ES a /pt-BR), actualizamos su cookie.
  const currentCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeInPath && currentCookie !== localeInPath) {
    response.cookies.set(i18n.cookieName, localeInPath, { 
      path: '/', 
      maxAge: 31536000, // 1 Año de persistencia
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // ---------------------------------------------------------------------------
  // 5. DELEGACIÓN AL GUARDIÁN DE RUTAS (Seguridad y RBAC)
  // ---------------------------------------------------------------------------
  const guardResponse = routeGuard(request, localeInPath);
  if (guardResponse) {
    // Si el guardián emite una redirección (ej: hacia /login), sobreescribe el flujo
    return guardResponse;
  }

  return response;
}

// ============================================================================
// CONFIGURACIÓN DEL MATCHER (Optimización del Motor Next.js)
// ============================================================================
export const config = {
  // Ignora completamente en la fase inicial del motor las rutas críticas y de CMS
  // Esto ahorra ciclos de cómputo Edge para rutas que sabemos que no requieren i18n.
  matcher:[
    '/((?!_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|admin).*)',
  ],
};