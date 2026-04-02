/**
 * @file middleware.ts
 * @description Enterprise Edge Traffic Orchestrator (The Sentinel v20.0).
 *              Orquesta la negociación de idioma, el blindaje de seguridad RBAC
 *              y la normalización de rutas para el ecosistema MetaShark.
 * @version 20.0 - Sovereign Root & Edge Integrity
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * @description SSoT para prefijos de infraestructura y activos estáticos.
 *              Estas rutas son excluidas del pipeline de internacionalización y seguridad.
 * @pilar_V: Adherencia Arquitectónica. Añadidos '/auth' y '/manifest.json' para
 *           prevenir 404s en el flujo de OAuth y la instalación de la PWA.
 */
const SYSTEM_PREFIXES = [
  '/_next', '/api', '/admin', '/_payload', '/static', '/images', 
  '/video', '/audio', '/fonts', '/icons', '/favicon.ico', 
  '/robots.txt', '/sitemap.xml', '/manifest.json', '/auth'
];

/**
 * @description Prefijos para el motor de enrutamiento dinámico (Gateway).
 */
const GATEWAY_PREFIXES = ['/r/'];

/**
 * @description Resuelve el idioma preferido del visitante basado en cookies o cabeceras.
 * @param {NextRequest} request - La petición entrante.
 * @returns {Locale} El código de idioma resuelto.
 */
function resolvePreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang.split(',').map(l => ({ code: l.split(';')[0].trim() }));
    for (const { code } of preferred) {
      if (isValidLocale(code)) return code;
      const baseLang = code.split('-')[0];
      const matchedBase = i18n.locales.find((l) => l.startsWith(baseLang));
      if (matchedBase) return matchedBase;
    }
  }
  return i18n.defaultLocale;
}

/**
 * @description El Middleware Soberano. Punto de entrada para todo el tráfico del Edge.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- 1. BYPASS DE INFRAESTRUCTURA Y ACTIVOS ESTÁTICOS (Fast-Path) ---
  if (SYSTEM_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // --- 2. BYPASS DEL GATEWAY DE ENRUTAMIENTO DINÁMICO ---
  if (GATEWAY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // --- 3. NEGOCIACIÓN DE IDIOMA Y NORMALIZACIÓN DE RUTA ---
  const segments = pathname.split('/').filter(Boolean);
  const activeLocale = segments[0];
  const isLocalized = isValidLocale(activeLocale);

  if (!isLocalized) {
    const preferredLocale = resolvePreferredLocale(request);
    
    /**
     * @pilar_VIII: Normalización Anti-404.
     * Si el path es la raíz ('/'), se redirige a '/[locale]'.
     * Para cualquier otra ruta, se antepone '/[locale]', evitando dobles barras.
     */
    const targetPath = pathname === '/' ? `/${preferredLocale}` : `/${preferredLocale}${pathname}`;
    const redirectUrl = new URL(`${targetPath}${search}`, request.url);
    
    console.log(`[HEIMDALL][I18N] Unlocalized request. Redirecting to: ${redirectUrl.pathname}`);
    return NextResponse.redirect(redirectUrl);
  }

  // --- 4. AUDITORÍA DE SEGURIDAD Y CONTROL DE ACCESO (RBAC) ---
  const guardResponse = await routeGuard(request, activeLocale as Locale);
  if (guardResponse) return guardResponse;

  // --- 5. RESPUESTA FINAL CON TELEMETRÍA DE BORDE ---
  const response = NextResponse.next();
  response.headers.set('X-Enterprise-Edge', 'Orchestrated_v20.0');
  return response;
}

export const config = {
  // Expresión regular mejorada para una exclusión más precisa de activos.
  matcher: [
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|favicon.ico|manifest.json).*)'
  ],
};