/**
 * @file middleware.ts
 * @description Enterprise Edge Traffic Orchestrator (Refactorizado v18.1)
 * @version 18.1 - Anti-404 Hardening & Path Normalization
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

const SYSTEM_PREFIXES = [
  '/_next', '/api', '/admin', '/_payload', '/static', 
  '/images', '/video', '/audio', '/fonts', '/icons',
  '/favicon.ico', '/robots.txt', '/sitemap.xml'
];

const GATEWAY_PREFIXES = ['/r/'];

function resolvePreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale as Locale;

  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',').map(l => ({ code: l.split(';')[0].trim() }));
    for (const { code } of preferred) {
      if (isValidLocale(code)) return code as Locale;
      const baseLang = code.split('-')[0];
      const matchedBase = i18n.locales.find((l) => l.startsWith(baseLang));
      if (matchedBase) return matchedBase as Locale;
    }
  }
  return i18n.defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. FAST-PATH: Static assets (Exclusión estricta)
  if (SYSTEM_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 2. DYNAMIC GATEWAY
  if (GATEWAY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 3. I18N NEGOTIATION
  const segments = pathname.split('/').filter(Boolean);
  const activeLocale = segments[0];
  const isLocalized = isValidLocale(activeLocale);

  if (!isLocalized) {
    const preferredLocale = resolvePreferredLocale(request);
    
    // Normalización: Asegura que la redirección no cree dobles slash
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const redirectUrl = new URL(`/${preferredLocale}${cleanPath}${search}`, request.url);
    
    return NextResponse.redirect(redirectUrl);
  }

  // 4. SECURITY AUDIT
  const guardResponse = await routeGuard(request, activeLocale as Locale);
  if (guardResponse) return guardResponse;

  const response = NextResponse.next();
  response.headers.set('X-Enterprise-Edge', 'Orchestrated_v18_1');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};