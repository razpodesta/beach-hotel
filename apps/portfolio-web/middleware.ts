/**
 * @file middleware.ts
 * @description Enterprise Edge Traffic Orchestrator (The Sentinel v20.1).
 *              Refactorizado: Normalización robusta de segmentos de URL y
 *              blindaje ante importaciones de infraestructura en el Edge.
 * @version 20.1 - Edge Resilience Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

const SYSTEM_PREFIXES = [
  '/_next', '/api', '/admin', '/_payload', '/static', '/images', 
  '/video', '/audio', '/fonts', '/icons', '/favicon.ico', 
  '/robots.txt', '/sitemap.xml', '/manifest.json', '/auth'
];

const GATEWAY_PREFIXES = ['/r/'];

function resolvePreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale as Locale;

  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',').map(l => l.split(';')[0].trim());
    for (const code of preferred) {
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

  // 1. BYPASS RÁPIDO
  if (SYSTEM_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 2. BYPASS GATEWAY
  if (GATEWAY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 3. NEGOCIACIÓN DE IDIOMA (Normalización robusta)
  const segments = pathname.split('/').filter(Boolean);
  const activeLocale = segments[0];
  const isLocalized = isValidLocale(activeLocale || '');

  if (!isLocalized) {
    const preferredLocale = resolvePreferredLocale(request);
    const targetPath = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(new URL(`${targetPath}${search}`, request.url));
  }

  // 4. AUDITORÍA RBAC (Guardia de Acceso)
  const guardResponse = await routeGuard(request, activeLocale as Locale);
  if (guardResponse) return guardResponse;

  const response = NextResponse.next();
  response.headers.set('X-Enterprise-Edge', 'Orchestrated_v20.1');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json).*)'],
};