/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador de tráfico en el Edge (Vercel).
 *              Blindaje de rutas de infraestructura (/admin, /api) y orquestación i18n.
 *              Corregidas las importaciones de alias que causaban errores TS2307 en Nx.
 * @version 14.1 - Path Aliases & Edge Security Fix
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * IMPORTACIONES DE CONTRATO (Fronteras Nx)
 * @fix TS2307: Como este archivo está en la raíz de portfolio-web, 
 * las rutas relativas apuntan correctamente dentro de ./src/.
 */
import { i18n, isValidLocale, type Locale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * RUTAS DE SISTEMA IGNORADAS
 * @pilar X: Rendimiento de Élite. 
 */
const SYSTEM_PATHS =[
  '/_next',
  '/api',        // Incluye /api/payload y /api/visitor
  '/admin',      // Panel Administrativo de Payload CMS
  '/_payload',   // Endpoints y assets internos de Payload v3
  '/static',
  '/images',
  '/favicon.ico'
];

/**
 * APARATO PRINCIPAL: Middleware
 * @description Intercepta, redirige y protege las peticiones entrantes.
 * @pilar VIII: Resiliencia - Manejo seguro de asincronía.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. BLINDAJE ESTRUCTURAL: Ignorar rutas de sistema y assets
  if (SYSTEM_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. ORQUESTACIÓN I18N
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    // Redirección al idioma por defecto preservando parámetros de búsqueda
    const locale = i18n.defaultLocale;
    const redirectUrl = new URL(`/${locale}${pathname}${search}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. SEGURIDAD RBAC (Route Guard)
  const potentialLocale = pathname.split('/')[1];
  const localeInPath = isValidLocale(potentialLocale) ? (potentialLocale as Locale) : i18n.defaultLocale;
  
  // Resolución asíncrona innegociable
  const guardResponse = await routeGuard(request, localeInPath);
  
  if (guardResponse) {
    return guardResponse;
  }

  return NextResponse.next();
}

/**
 * CONFIGURACIÓN DE EDGE
 */
export const config = {
  matcher:[
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};