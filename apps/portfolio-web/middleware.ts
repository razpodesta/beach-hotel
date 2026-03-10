// RUTA: apps/portfolio-web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

// CONSTANTES TÉCNICAS
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_KEY = process.env.BYPASS_MAINTENANCE_KEY;

// EXCLUSIONES DE ALTO RENDIMIENTO (Assets estáticos)
const PUBLIC_FILE = /\.(.*)$/;

function getLocale(request: NextRequest): Locale {
  // 1. Cookie de preferencia (Máxima prioridad persistente)
  const localeCookie = request.cookies.get(i18n.cookieName)?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }

  // 2. Negociación de Headers (Preferencia del navegador)
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(languages, [...i18n.locales], i18n.defaultLocale) as Locale;
  } catch {
    return i18n.defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // 1. IGNORAR ASSETS INTERNOS (Optimización crítica)
  // ---------------------------------------------------------------------------
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // 2. PROTOCOLO DE MANTENIMIENTO (Kill Switch)
  // ---------------------------------------------------------------------------
  if (MAINTENANCE_MODE) {
    // Permite acceso si se tiene la cookie de bypass (para admins)
    const bypassCookie = request.cookies.get('maintenance_bypass');

    // Si no es admin y no estamos ya en la página de mantenimiento
    if (bypassCookie?.value !== BYPASS_KEY && !pathname.includes('/maintenance')) {
      // Detectamos locale para mostrar mantenimiento en el idioma correcto
      const locale = getLocale(request);
      return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
    }
  }

  // ---------------------------------------------------------------------------
  // 3. NORMALIZACIÓN DE LOCALE
  // ---------------------------------------------------------------------------
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // Redirección 307 para mantener POST data si fuera necesario
    const response = NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${search}`, request.url)
    );

    return response;
  }

  // Extraer locale de la URL actual
  const localeInPath = i18n.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) as Locale;

  // ---------------------------------------------------------------------------
  // 4. SINCRONIZACIÓN DE COOKIE
  // ---------------------------------------------------------------------------
  const response = NextResponse.next();

  // Si el usuario cambia el idioma manualmente en la URL, actualizamos su cookie
  if (localeInPath && request.cookies.get(i18n.cookieName)?.value !== localeInPath) {
    response.cookies.set(i18n.cookieName, localeInPath, { path: '/', maxAge: 31536000 });
  }

  // ---------------------------------------------------------------------------
  // 5. GUARDIÁN DE RUTAS (Seguridad)
  // ---------------------------------------------------------------------------
  const guardResponse = routeGuard(request, localeInPath);
  if (guardResponse) return guardResponse;

  return response;
}

export const config = {
  // Matcher negativo optimizado: Excluye todo lo que no necesita procesamiento
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};
