/**
 * @file middleware.ts
 * @description Enterprise Edge Traffic Orchestrator for MetaShark Ecosystem.
 *              Refactorizado: Procesamiento de Gateways Dinámicos, optimización 
 *              de localización O(1) y blindaje de activos de infraestructura.
 * @version 17.0 - Enterprise Standard & Dynamic Routing
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * INFRASTRUCTURE CONTRACTS
 * @pilar V: Monorepo architectural adherence.
 */
import { i18n, isValidLocale } from './src/config/i18n.config';
import { routeGuard } from './src/lib/route-guard';

/**
 * SYSTEM SEGMENT EXCLUSIONS (SSoT)
 * @description Static assets and internal API prefixes.
 */
const SYSTEM_PREFIXES = [
  '/_next', '/api', '/admin', '/_payload', '/static', 
  '/images', '/video', '/audio', '/fonts', '/icons'
];

/**
 * ENTERPRISE GATEWAYS
 * @description Prefixes handled by the Dynamic Routing Manager.
 */
const GATEWAY_PREFIXES = ['/r/'];

/**
 * APARATO PRINCIPAL: middleware
 * @description Edge-side request processing for high-performance orchestration.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. FAST-PATH: STATIC ASSET FILTERING
  // @pilar X: Performance. Bypassing logic for binary streams and metadata.
  if (
    SYSTEM_PREFIXES.some((path) => pathname.startsWith(path)) ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. ENTERPRISE GATEWAY RESOLUTION (Smart QR)
  // Intercepta peticiones de enrutamiento contextual (estilo asiático).
  const isGateway = GATEWAY_PREFIXES.some((path) => pathname.startsWith(path));
  if (isGateway) {
    console.log(`[GATEWAY] Intercepting Dynamic Route: ${pathname}`);
    // Permitimos que la petición llegue al Route Handler de la aplicación
    return NextResponse.next();
  }

  // 3. LOCALE HANDSHAKE (O(1) Detection)
  const segments = pathname.split('/');
  const activeLocale = segments[1];
  
  const isLocalized = isValidLocale(activeLocale);

  if (!isLocalized) {
    const defaultLocale = i18n.defaultLocale;
    
    /** @pilar IV: Enterprise Telemetry */
    console.info(`[EDGE] I18N_HANDSHAKE: Normalizing route to ${defaultLocale}`);

    /**
     * URL NORMALIZATION
     * Preserves original path and query parameters for UTM tracking.
     */
    const redirectUrl = new URL(
      `/${defaultLocale}${pathname === '/' ? '' : pathname}${search}`, 
      request.url
    );
    
    return NextResponse.redirect(redirectUrl);
  }

  // 4. SECURITY AUDIT (RBAC Gating)
  // Delegates identity and permission validation to the specialized guard.
  const guardResponse = await routeGuard(request, activeLocale);
  
  if (guardResponse) {
    return guardResponse;
  }

  // 5. RESPONSE FINALIZATION
  const response = NextResponse.next();
  
  /**
   * INFRASTRUCTURE HEADERS
   * X-Enterprise-Edge: Confirmation of middleware processing.
   * X-Locale-Active: Injected for front-end consistency.
   */
  response.headers.set('X-Enterprise-Edge', 'Orchestrated_v17');
  response.headers.set('X-Locale-Active', activeLocale);
  
  return response;
}

/**
 * EDGE MATCHER CONFIGURATION
 * @description High-performance filter to minimize Edge Function execution.
 */
export const config = {
  matcher: [
    /**
     * Exclude system files and internal Next.js assets to save execution units.
     */
    '/((?!api|_next/static|_next/image|images|video|audio|fonts|icons|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};