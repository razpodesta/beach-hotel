/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador de tráfico en el Edge. Gestiona i18n, seguridad (RBAC),
 *              modo mantenimiento y blindaje de rutas críticas del CMS.
 * @version 9.0
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

// --- CONFIGURACIÓN DE ENTORNO ---
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_KEY = process.env.BYPASS_MAINTENANCE_KEY;

/**
 * Expresión regular optimizada para detectar recursos estáticos.
 * Evita que el middleware procese imágenes, fuentes o scripts individuales.
 */
const PUBLIC_FILE_REGEX = /\.(.*)$/;

/**
 * Rutas soberanas que eluden la negociación de idioma (Payload CMS & Next internals).
 */
const SYSTEM_PATHS = ['/_next', '/api', '/admin', '/static', '/images', '/fonts', '/audio'];

/**
 * Negocia el idioma preferido basado en cookies o headers de aceptación.
 * @param request Solicitud entrante del cliente.
 * @returns Locale validado y soportado por el ecosistema.
 */
function getPreferredLocale(request: NextRequest): Locale {
  // 1. Prioridad: Cookie persistente de elección del usuario.
  const localeCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // 2. Negociación vía Navegador.
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages, [...i18n.locales], i18n.defaultLocale) as Locale;
  } catch {
    // Fail-safe: Retorno al idioma innegociable por defecto (pt-BR).
    return i18n.defaultLocale;
  }
}

/**
 * Middleware Principal (Next.js 15 Edge Runtime).
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. BLINDAJE TÉCNICO: Bypass para assets y rutas de sistema.
  const isSystemPath = SYSTEM_PATHS.some((path) => pathname.startsWith(path));
  if (isSystemPath || PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // 2. PROTOCOLO HEIMDALL: Mantenimiento de Alta Disponibilidad.
  if (MAINTENANCE_MODE) {
    const bypassCookie = request.cookies.get('maintenance_bypass');
    if (bypassCookie?.value !== BYPASS_KEY && !pathname.includes('/maintenance')) {
      const locale = getPreferredLocale(request);
      return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
    }
  }

  // 3. ENRUTAMIENTO I18N: Validación de prefijos de idioma.
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getPreferredLocale(request);
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    
    return NextResponse.redirect(
      new URL(`/${locale}${normalizedPath}${search}`, request.url)
    );
  }

  // Resolución del locale actual tras validación.
  const localeInPath = i18n.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) as Locale;

  const response = NextResponse.next();

  // 4. PERSISTENCIA DE PREFERENCIAS: Sincronización de Cookie.
  const currentCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeInPath && currentCookie !== localeInPath) {
    response.cookies.set(i18n.cookieName, localeInPath, { 
      path: '/', 
      maxAge: 31536000, // 1 año.
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // 5. GUARDIÁN SOBERANO: Ejecución de seguridad y RBAC.
  const guardResponse = routeGuard(request, localeInPath);
  if (guardResponse) return guardResponse;

  return response;
}

export const config = {
  /**
   * Matcher optimizado para ignorar rutas que Webpack procesa de forma nativa.
   * Mejora la latencia al reducir ejecuciones innecesarias en el Edge.
   */
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|admin).*)',
  ],
};