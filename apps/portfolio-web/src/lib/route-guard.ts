/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Centinela de Borde e Inteligencia de Acceso Perimetral (RBAC).
 *              Refactorizado: Implementación de "Sovereign Passport" para inyección
 *              de identidad en cabeceras y orquestación de autoridad Zero-Latency.
 *              Estándar: Heimdall v2.5 (Forensic Trace & Edge Immunity).
 * @version 11.0 - Sovereign Passport & Edge Immutable Matrix
 * @author Staff Engineer - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { type Locale } from '../config/i18n.config';
import { mainNavStructure } from './nav-links';

/** 
 * IMPORTACIONES DE CONTRATO (Pure Types)
 * @pilar III: Seguridad de Tipos Absoluta.
 * El uso de 'import type' es innegociable para evitar fugas de binarios 
 * del CMS hacia el bundle del Edge de Vercel.
 */
import type { SovereignRoleType } from '@metashark/cms-core';

// ============================================================================
// CONFIGURACIÓN DE INFRAESTRUCTRURA (SSoT)
// ============================================================================

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', bold: '\x1b[1m'
};

/** 
 * @constant PROTECTION_MAP
 * @description Mapa de Gating Jerárquico. Las rutas se evalúan por especificidad.
 */
const PROTECTION_MAP: Array<{ path: string; minRole: SovereignRoleType }> = [
  { path: '/portal/dev', minRole: 'developer' },
  { path: '/portal/admin', minRole: 'admin' },
  { path: '/portal/b2b', minRole: 'operator' },
  { path: '/p/', minRole: 'operator' }, // White-label partner routes
  { path: '/portal/vip', minRole: 'sponsor' },
  { path: '/portal', minRole: 'guest' },
];

/** @constant INFRA_BYPASS Recursos exentos de escrutinio por el centinela */
const INFRA_BYPASS = ['/admin', '/_payload', '/api/payload', '/auth/callback', '/r/'];

/** @constant PUBLIC_WHITELIST Perímetros de libre circulación */
const PUBLIC_WHITELIST = new Set([
  '/', '/contacto', '/blog', '/maintenance', '/quienes-somos', 
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
 * @interface SovereignPassport
 * @description Contrato de identidad inyectado en el flujo de la petición.
 */
export interface SovereignPassport {
  isAuthenticated: boolean;
  role: SovereignRoleType | 'anonymous';
  tenantId: string | null;
  traceId: string;
}

/**
 * MATRIZ DE AUTORIDAD ESPEJO (Inmutable)
 * @pilar IX: Desacoplamiento. Refleja la jerarquía del CMS sin llamadas a DB.
 */
const AUTHORITY_WEIGHTS: Record<SovereignRoleType | 'anonymous', number> = {
  developer: 99,
  admin: 50,
  operator: 30,
  sponsor: 20,
  guest: 10,
  anonymous: 0,
};

/**
 * @function resolveSovereignPassport
 * @description Analiza el tráfico y sintetiza el pasaporte de identidad.
 */
function resolveSovereignPassport(req: NextRequest, traceId: string): SovereignPassport {
  // 1. PROTOCOLO DE BYPASS (Emergencia / Dev Node)
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      isAuthenticated: true, role: 'developer', 
      tenantId: '00000000-0000-0000-0000-000000000001', traceId 
    };
  }

  // 2. EXTRACCIÓN DE TOKENS CRIPTOGRÁFICOS
  const payloadToken = req.cookies.get('payload-token')?.value;
  const supabaseToken = req.cookies.get('sb-access-token')?.value;

  if (payloadToken) return { isAuthenticated: true, role: 'developer', tenantId: 'ROOT_INFRA', traceId };
  if (supabaseToken) return { isAuthenticated: true, role: 'guest', tenantId: null, traceId };

  return { isAuthenticated: false, role: 'anonymous', tenantId: null, traceId };
}

// ============================================================================
// APARATO PRINCIPAL: routeGuard
// ============================================================================

/**
 * @function routeGuard
 * @description Centinela de tráfico de borde. Orquesta el Gating RBAC y la telemetría.
 * @param {NextRequest} request - Petición entrante.
 * @param {Locale} locale - Idioma resuelto.
 * @returns {Promise<NextResponse | null>} Respuesta de redirección o permiso de paso.
 */
export async function routeGuard(request: NextRequest, locale: Locale): Promise<NextResponse | null> {
  const startTime = performance.now();
  const traceId = `sig_guard_${Date.now().toString(36).toUpperCase()}`;
  const { pathname } = request.nextUrl;

  /**
   * @function emitForensicLog
   * @description Reporta la decisión del centinela al log de infraestructura.
   */
  const emitForensicLog = (status: 'GRANTED' | 'REJECTED' | 'REDIRECTED', reason: string, passport: SovereignPassport) => {
    const duration = (performance.now() - startTime).toFixed(2);
    const statusColor = status === 'GRANTED' ? C.green : (status === 'REJECTED' ? C.red : C.yellow);
    
    console.log(
      `${C.magenta}[DNA][GUARD]${C.reset} ${statusColor}${status.padEnd(10)}${C.reset} | ` +
      `${pathname.padEnd(30)} | ` +
      `Role: ${passport.role.padEnd(10)} | ` +
      `Lat: ${duration}ms | ` +
      `Trace: ${traceId} | ` +
      `Audit: ${reason}`
    );
  };

  // 1. FILTRO DE INFRAESTRUCTRURA (Bypass Directo)
  if (INFRA_BYPASS.some((prefix) => pathname.startsWith(prefix))) return null;

  // 2. NORMALIZACIÓN DE RUTA LÓGICA
  const logicalPath = pathname.replace(`/${locale}`, '') || '/';
  
  // 3. VALIDACIÓN DE PERÍMETRO PÚBLICO
  const isPublic = PUBLIC_WHITELIST.has(logicalPath) || 
                   logicalPath.startsWith('/blog/') || 
                   logicalPath.startsWith('/legal/');

  if (isPublic) return null;

  // 4. HANDSHAKE DE PASAPORTE
  const passport = resolveSovereignPassport(request, traceId);
  
  // 5. GATING DE IDENTIDAD (Authentication Guard)
  if (!passport.isAuthenticated) {
    emitForensicLog('REDIRECTED', 'Identity required for non-public perimeter', passport);
    const loginRedirect = new URL(`/${locale}`, request.url);
    loginRedirect.searchParams.set('auth', 'required');
    return NextResponse.redirect(loginRedirect);
  }

  // 6. GATING DE AUTORIDAD (RBAC Protocol)
  const matchingRule = PROTECTION_MAP.find(rule => 
    logicalPath === rule.path || logicalPath.startsWith(`${rule.path}/`)
  );

  if (matchingRule) {
    const userWeight = AUTHORITY_WEIGHTS[passport.role] || 0;
    const requiredWeight = AUTHORITY_WEIGHTS[matchingRule.minRole];

    if (userWeight < requiredWeight) {
      emitForensicLog('REJECTED', `Hierarchy Drift: User(${userWeight}) < Required(${requiredWeight})`, passport);
      // Evacuación al área base del portal para evitar bucles de redirección
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
    }
  }

  // 7. SELLO DE PASAJE & INYECCIÓN DE PASAPORTE (Header Sync)
  emitForensicLog('GRANTED', 'Clearance verified by Edge Node', passport);

  const passportHeaders = new Headers(request.headers);
  passportHeaders.set('X-Heimdall-Trace', traceId);
  passportHeaders.set('X-Sovereign-Role', passport.role);
  if (passport.tenantId) passportHeaders.set('X-Sovereign-Tenant', passport.tenantId);

  return NextResponse.next({
    request: { headers: passportHeaders }
  });
}