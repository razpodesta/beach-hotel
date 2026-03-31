/**
 * @file apps/portfolio-web/middleware.ts
 * @description Orquestador Soberano de Tráfico en el Edge (Vercel).
 *              Refactorizado: Detección de locale optimizada (O(1)), normalización
 *              de rumbos SEO y blindaje perimetral RBAC.
 * @version 16.0 - Edge Performance Optimized & SEO Guarded
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * IMPORTACIONES DE CONTRATO
 * @pilar V: Adherencia arquitectónica.
 */
import { i18n, isValidLocale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * MATRIZ DE EXCLUSIÓN (SSoT)
 * @description Rutas que no requieren internacionalización ni lógica de negocio.
 */
const PUBLIC_ASSET_PREFIXES = [
  '/_next', '/api', '/admin', '/_payload', '/static', 
  '/images', '/video', '/audio', '/fonts', '/icons'
];

/**
 * APARATO PRINCIPAL: middleware
 * @description Punto de control único para la red soberana MetaShark.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. PROTOCOLO DE EXCLUSIÓN RÁPIDA (Early Exit)
  // @pilar X: Performance - Evita procesar lógica pesada para activos binarios.
  if (
    PUBLIC_ASSET_PREFIXES.some((path) => pathname.startsWith(path)) ||
    pathname.includes('.') // Archivos con extensión (favicon.ico, sitemap.xml)
  ) {
    return NextResponse.next();
  }

  // 2. AUDITORÍA DE LOCALIZACIÓN (O(1) Detection)
  const segments = pathname.split('/');
  const firstSegment = segments[1]; // El segmento tras el primer slash
  
  const hasValidLocale = isValidLocale(firstSegment);

  if (!hasValidLocale) {
    const locale = i18n.defaultLocale;
    
    /** @pilar IV: Protocolo Heimdall - Trazabilidad de Redirección */
    console.info(`[HEIMDALL][EDGE] I18N_HANDSHAKE: Missing locale. Routing to ${locale}`);

    /**
     * @fix: Normalización de rumbos.
     * Preserva la ruta original y los parámetros de búsqueda (UTM/Query).
     */
    const redirectUrl = new URL(
      `/${locale}${pathname === '/' ? '' : pathname}${search}`, 
      request.url
    );
    
    return NextResponse.redirect(redirectUrl);
  }

  // 3. SEGURIDAD PERIMETRAL (RBAC Gating)
  // El guardia resuelve si el usuario tiene nivel para el rumbo solicitado.
  const localeInPath = firstSegment;
  const guardResponse = await routeGuard(request, localeInPath);
  
  if (guardResponse) {
    // Si el guardia emite una decisión (Redirect), la ejecutamos de inmediato.
    return guardResponse;
  }

  // 4. FINALIZACIÓN Y TELEMETRÍA DE RESPUESTA
  const response = NextResponse.next();
  
  /**
   * @description Inyectamos metadatos de infraestructura para auditoría en vivo.
   * X-MetaShark-Edge: Confirma que la petición pasó por el orquestador.
   * X-Locale-Active: Sincronía del nodo lingüístico.
   */
  response.headers.set('X-MetaShark-Edge', 'Orchestrated_v16');
  response.headers.set('X-Locale-Active', localeInPath);
  
  return response;
}

/**
 * CONFIGURACIÓN DE SELECTORES (Edge Matcher)
 * @description Filtra el tráfico a nivel de kernel de Vercel para maximizar el throughput.
 */
export const config = {
  matcher: [
    /**
     * Excluimos explícitamente rutas de sistema para que el Middleware
     * no consuma unidades de ejecución (Edge Function execution units) en vano.
     */
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|icons|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};