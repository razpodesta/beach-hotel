/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Centinela de Borde e Inteligencia de Acceso Perimetral (RBAC).
 *              Orquesta la validación de autoridad Zero-Latency mediante la
 *              síntesis del "AuthorizedPassport" y el Gating jerárquico.
 *              Nivelado: Telemetría Heimdall v3.0, Anti-Caché Poisoning y
 *              detección algorítmica de firmas de sesión SSR.
 * 
 * @version 15.0 - MES Compliance & Path Normalization Hardening
 * @author Staff Engineer - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { type Locale } from '../config/i18n.config';
import { mainNavStructure } from './nav-links';

/** 
 * IMPORTACIONES DE CONTRATO (Pure Types)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
import type { SovereignRoleType as AuthorizedRole } from '@metashark/cms-core';

// ============================================================================
// CONFIGURACIÓN DE INFRAESTRUCTRURA (SSoT)
// ============================================================================

const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m', 
  yellow: '\x1b[33m', 
  red: '\x1b[31m', 
  magenta: '\x1b[35m', 
  bold: '\x1b[1m'
} as const;

/** 
 * @constant PROTECTION_MAP
 * @description Mapa de Gating Jerárquico (RBAC).
 */
const PROTECTION_MAP: Array<{ path: string; minRole: AuthorizedRole }> = [
  { path: '/portal/dev', minRole: 'developer' },
  { path: '/portal/admin', minRole: 'admin' },
  { path: '/portal/b2b', minRole: 'operator' },
  { path: '/p/', minRole: 'operator' },
  { path: '/portal/vip', minRole: 'sponsor' },
  { path: '/portal', minRole: 'guest' },
];

/** @constant INFRA_BYPASS Recursos exentos de escrutinio perimetral */
const INFRA_BYPASS = ['/admin', '/_payload', '/api/payload', '/auth/callback', '/r/'];

/** @constant PUBLIC_WHITELIST Perímetros de libre circulación */
const PUBLIC_WHITELIST = new Set([
  '/', '/contacto', '/blog', '/maintenance', '/quien-soy', 
  '/mision-y-vision', '/festival', '/paquetes', '/subscribe', 
  '/server-error'
]);

// Sincronización dinámica de la lista blanca desde el mapa de navegación
mainNavStructure.forEach((item) => {
  if (item.href && !item.href.startsWith('http')) {
    PUBLIC_WHITELIST.add(item.href.split('#')[0]);
  }
});

// ============================================================================
// MOTORES DE IDENTIDAD (Edge-Safe Engines)
// ============================================================================

/**
 * @interface AuthorizedPassport
 * @description Contrato de identidad inyectado en el flujo de la petición.
 */
export interface AuthorizedPassport {
  isAuthenticated: boolean;
  role: AuthorizedRole | 'anonymous';
  tenantId: string | null;
  traceId: string;
}

/**
 * MATRIZ DE AUTORIDAD (Inmutable)
 * @pilar IX: Refleja la jerarquía sin llamadas externas (Zero-Latency).
 */
const AUTHORITY_WEIGHTS: Record<AuthorizedRole | 'anonymous', number> = {
  developer: 99,
  admin: 50,
  operator: 30,
  sponsor: 20,
  guest: 10,
  anonymous: 0,
};

/**
 * @function resolveAuthorizedPassport
 * @description Sintetiza el pasaporte de identidad analizando tokens en Cookies.
 */
function resolveAuthorizedPassport(req: NextRequest, traceId: string): AuthorizedPassport {
  // 1. Protocolo de Bypass (Dev Mode)
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      isAuthenticated: true, role: 'developer', 
      tenantId: 'DEV_NODE_AUTH', traceId 
    };
  }

  // 2. Extracción de Firmas Criptográficas
  const payloadToken = req.cookies.get('payload-token')?.value;
  
  // Detección de sesión Supabase SSR (Escaneo de prefijos sb-*)
  const hasSupabaseSession = req.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );

  if (payloadToken) return { isAuthenticated: true, role: 'developer', tenantId: 'ROOT_INFRA', traceId };
  if (hasSupabaseSession) return { isAuthenticated: true, role: 'guest', tenantId: null, traceId };

  return { isAuthenticated: false, role: 'anonymous', tenantId: null, traceId };
}

/**
 * @function safeEdgeRedirect
 * @description Inyecta cabeceras Anti-Poisoning en redirecciones de seguridad.
 */
function safeEdgeRedirect(url: URL): NextResponse {
  const response = NextResponse.redirect(url, 307);
  // @pilar VIII: Evita el envenenamiento de caché en el Edge de Vercel.
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

// ============================================================================
// APARATO PRINCIPAL: routeGuard
// ============================================================================

export async function routeGuard(request: NextRequest, locale: Locale): Promise<NextResponse | null> {
  const startTime = performance.now();
  const traceId = `sig_guard_${Date.now().toString(36).toUpperCase()}`;
  const { pathname, search } = request.nextUrl;

  /**
   * TELEMETRÍA HEIMDALL (Audit Protocol)
   */
  const emitTelemetry = (status: 'GRANTED' | 'REJECTED' | 'REDIRECTED', reason: string, passport: AuthorizedPassport) => {
    const duration = (performance.now() - startTime).toFixed(2);
    const statusColor = status === 'GRANTED' ? C.green : (status === 'REJECTED' ? C.red : C.yellow);
    
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `${C.magenta}[DNA][TELEMETRY]${C.reset} ${statusColor}${status.padEnd(10)}${C.reset} | ` +
        `${pathname.padEnd(30)} | ` +
        `Role: ${passport.role.padEnd(10)} | ` +
        `Lat: ${duration}ms | ` +
        `Audit: ${reason}`
      );
    }
  };

  // 1. Bypass de Infraestructura
  if (INFRA_BYPASS.some((prefix) => pathname.startsWith(prefix))) return null;

  // 2. Normalización de Ruta Lógica (Sin segmento de idioma)
  const segments = pathname.split('/').filter(Boolean);
  const logicalPath = segments.length > 1 ? `/${segments.slice(1).join('/')}` : '/';
  
  // 3. Verificación de Perímetro Público
  // Se incluyen familias dinámicas (blog/*, legal/*)
  const isPublicFamily = logicalPath.startsWith('/blog') || logicalPath.startsWith('/legal');
  const isWhitelisted = PUBLIC_WHITELIST.has(logicalPath) || isPublicFamily;

  if (isWhitelisted) return null;

  // 4. Handshake de Pasaporte
  const passport = resolveAuthorizedPassport(request, traceId);
  
  // 5. Gating de Autenticidad
  if (!passport.isAuthenticated) {
    emitTelemetry('REDIRECTED', 'Identity required for protected perimeter', passport);
    const loginUrl = new URL(`/${locale}/login${search}`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return safeEdgeRedirect(loginUrl);
  }

  // 6. Gating de Autoridad (RBAC)
  const matchingRule = PROTECTION_MAP.find(rule => 
    logicalPath === rule.path || logicalPath.startsWith(`${rule.path}/`)
  );

  if (matchingRule) {
    const userWeight = AUTHORITY_WEIGHTS[passport.role] || 0;
    const requiredWeight = AUTHORITY_WEIGHTS[matchingRule.minRole];

    if (userWeight < requiredWeight) {
      emitTelemetry('REJECTED', `Hierarchy Drift: ${passport.role} < ${matchingRule.minRole}`, passport);
      return safeEdgeRedirect(new URL(`/${locale}/portal${search}`, request.url));
    }
  }

  // 7. Handshake Final (Pasaje Concedido)
  emitTelemetry('GRANTED', 'Clearance verified by Boundary Centinel', passport);

  // Sincronización de cabeceras de autoridad para Server Components
  const headers = new Headers(request.headers);
  headers.set('X-Heimdall-Trace', traceId);
  headers.set('X-Authorized-Role', passport.role);
  if (passport.tenantId) headers.set('X-Authorized-Tenant', passport.tenantId);

  return NextResponse.next({
    request: { headers }
  });
}