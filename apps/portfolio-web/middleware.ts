/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador Soberano de Tráfico en el Edge (Vercel).
 *              Implementa orquestación i18n proactiva, blindaje RBAC y 
 *              protocolo de exclusión de infraestructura de alto rendimiento.
 * @version 15.0 - Next-Gen Edge & Forensic Telemetry
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * IMPORTACIONES DE CONTRATO (Sincronización Monorepo)
 * @pilar V: Adherencia arquitectónica mediante rutas relativas internas.
 */
import { i18n, isValidLocale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * MATRIZ DE EXCLUSIÓN DE INFRAESTRUCTRURA (SSoT)
 * @pilar X: Rendimiento de Élite. Estas rutas nunca activarán la lógica i18n.
 */
const INFRA_PREFIXES = [
  '/_next',
  '/_vercel',
  '/api',
  '/admin',
  '/_payload',
  '/static',
  '/images',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * APARATO PRINCIPAL: middleware
 * @description Controla el ciclo de vida de la petición en el perímetro de Vercel.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  /**
   * 1. PROTOCOLO DE EXCLUSIÓN RÁPIDA (Early Exit)
   */
  const isInfra = INFRA_PREFIXES.some((path) => pathname.startsWith(path));
  if (isInfra) {
    return NextResponse.next();
  }

  /**
   * 2. AUDITORÍA DE LOCALIZACIÓN (i18n Orchestration)
   * Verifica si el prefijo de idioma está presente en la ruta.
   */
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = i18n.defaultLocale;
    
    // Protocolo Heimdall: Trazabilidad de redirección i18n
    console.log(`[HEIMDALL][EDGE] I18N_REDIRECT: ${pathname} -> /${locale}${pathname}`);

    /**
     * @fix Next.js 15: Normalización de rumbos. 
     * Preservamos parámetros de búsqueda (UTM, Session IDs).
     */
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}${search}`, request.url)
    );
  }

  /**
   * 3. SEGURIDAD PERIMETRAL (RBAC Guard)
   * Delegamos la inteligencia de acceso al aparato especializado.
   */
  const currentLocale = pathname.split('/')[1];
  const localeInPath = isValidLocale(currentLocale) ? currentLocale : i18n.defaultLocale;

  // El routeGuard realiza el handshake asíncrono con las cookies de sesión
  const guardResponse = await routeGuard(request, localeInPath);
  
  if (guardResponse) {
    // Si el guardia retorna una respuesta, abortamos y aplicamos su decisión (Redirect/401)
    return guardResponse;
  }

  /**
   * 4. FINALIZACIÓN Y HEADER DE RASTREO
   * Inyectamos cabeceras de infraestructura para depuración en producción.
   */
  const response = NextResponse.next();
  response.headers.set('X-MetaShark-Edge', 'Orchestrated');
  response.headers.set('X-Locale-Active', localeInPath);

  return response;
}

/**
 * CONFIGURACIÓN DE SELECTORES (Edge Matcher)
 * @description Filtra el tráfico antes de ejecutar el JS para maximizar performance.
 * Se excluyen extensiones estáticas comunes.
 */
export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos:
     * - .svg, .png, .jpg, .jpeg, .gif, .webp (Media)
     * - .css, .js (Assets)
     * - favicon.ico, robots.txt (Metadata)
     */
    '/((?!api|_next/static|_next/image|images|static|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};