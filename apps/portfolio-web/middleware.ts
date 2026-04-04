/**
 * @file middleware.ts
 * @description Enterprise Edge Traffic Orchestrator (Optimized).
 * @version 22.0 - Edge Performance Hardened
 */

import { NextResponse, type NextRequest } from 'next/server';
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

const EXCLUDED_PREFIXES = [
  '/_next', '/api', '/_payload', '/static', '/images', '/video', 
  '/audio', '/fonts', '/icons', '/favicon.ico', '/robots.txt', 
  '/sitemap.xml', '/manifest.json', '/auth', '/r/'
];

function getPreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0];
    const matched = i18n.locales.find(l => l.startsWith(preferred));
    if (matched) return matched as Locale;
  }
  return i18n.defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass rápido (Zero-Latency for Assets)
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 2. Determinación de Idioma
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0];

  if (!isValidLocale(currentLocale)) {
    const locale = getPreferredLocale(request);
    // Redirección con URL construida de forma eficiente
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  // 3. Guardia de Acceso (RBAC + Auth)
  const guardResponse = await routeGuard(request, currentLocale);
  if (guardResponse) return guardResponse;

  const response = NextResponse.next();
  response.headers.set('X-Enterprise-Edge', 'Orchestrated_v22.0');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json).*)'
  ],
};