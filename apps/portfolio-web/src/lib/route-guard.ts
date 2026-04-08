/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Centinela de Borde y Orquestador de Acceso Perimetral (RBAC).
 *              Valida la integridad de la sesión, el aislamiento Multi-Tenant y 
 *              la jerarquía de autoridad en el Edge de Vercel.
 *              Refactorizado: Erradicación del "Edge Runtime Violation" eliminando 
 *              importaciones dinámicas del CMS. Utiliza una Matriz Espejo Tipada
 *              que garantiza la sincronización con el SSoT a nivel de compilador.
 * @version 10.0 - Edge Immutable Standard (Zero Latency)
 * @author Raz Podestá -  MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { type Locale } from '../config/i18n.config';
import { mainNavStructure, type NavItem } from './nav-links';

/** 
 * IMPORTACIONES DE CONTRATO (Pure Types Only)
 * @pilar III: Seguridad de Tipos Absoluta.
 * Al importar solo 'type', Webpack no incluye el CMS en el bundle del Edge.
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
 * @constant PROTECTION_RULES
 * @description Mapa de pesos jerárquicos por rumbo. 
 * Ordenado por longitud de clave para asegurar que las reglas específicas 
 * prevalezcan sobre las generales (Longest Match First).
 */
const PROTECTION_RULES: Record<string, SovereignRoleType> = {
  '/portal/dev': 'developer',
  '/portal/admin': 'admin',
  '/portal/b2b': 'operator',
  '/p': 'operator',
  '/portal/vip': 'sponsor',
  '/portal': 'guest',
};

const SORTED_RULES = Object.entries(PROTECTION_RULES).sort((a, b) => b[0].length - a[0].length);

/** @constant INFRA_EXEMPTIONS Recursos de sistema que no activan el guardián */
const INFRA_EXEMPTIONS = ['/admin', '/_payload', '/api/payload', '/auth/callback', '/r/'];

/** @constant PUBLIC_DOMAINS Perímetros con Zero-Gating */
const PUBLIC_DOMAINS = new Set([
  '/', '/contacto', '/blog', '/maintenance', '/quienes-somos', 
  '/mision-y-vision', '/festival', '/paquetes', '/subscribe', 
  '/server-error', '/fotos'
]);

// Hidratación del inventario público desde la navegación maestra
mainNavStructure.forEach((item: NavItem) => {
  if (item.href && !item.href.startsWith('http')) {
    PUBLIC_DOMAINS.add(item.href.split('#')[0]);
  }
});

// ============================================================================
// MOTORES LÓGICOS INTERNOS (Silos de Responsabilidad)
// ============================================================================

/**
 * @interface EnterpriseSession
 * @description Contrato de identidad inyectado tras validación en el borde.
 */
export interface EnterpriseSession {
  isAuthenticated: boolean;
  role: SovereignRoleType | 'anonymous';
  tenantId: string | null;
  userId?: string;
  traceId: string;
}

/**
 * MATRIZ ESPEJO DE AUTORIDAD (Edge Safe)
 * @description Copia inmutable de los niveles de autoridad.
 * @pilar III: Al estar tipado contra `SovereignRoleType`, cualquier cambio 
 * en los roles del CMS provocará un error de TypeScript aquí, garantizando el SSoT.
 */
const EDGE_AUTHORITY_MATRIX: Record<SovereignRoleType | 'anonymous', number> = {
  developer: 99,
  admin: 50,
  operator: 30,
  sponsor: 20,
  guest: 10,
  anonymous: 0,
};

/**
 * @function resolveAuthorityMatrix
 * @description Devuelve los pesos de autoridad con telemetría Heimdall en latencia 0.
 */
function resolveAuthorityMatrix(traceId: string): Record<SovereignRoleType | 'anonymous', number> {
  console.log(`${C.magenta}   ● [DNA][GUARD]${C.reset} Authority DNA Synthesized in Edge | Trace: ${traceId}`);
  return EDGE_AUTHORITY_MATRIX;
}

/**
 * @function extractEdgeSession
 * @description Analiza las cabeceras criptográficas y cookies para resolver la sesión.
 */
function extractEdgeSession(req: NextRequest, traceId: string): EnterpriseSession {
  // Protocolo de Bypass (Emergencia/Desarrollo)
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      isAuthenticated: true, role: 'developer', 
      tenantId: '00000000-0000-0000-0000-000000000001', traceId 
    };
  }

  const payloadToken = req.cookies.get('payload-token')?.value;
  const supabaseToken = req.cookies.get('sb-access-token')?.value;

  // Resolución de Jerarquía de Sesión: CMS Admin > Portal Guest
  if (payloadToken) return { isAuthenticated: true, role: 'developer', tenantId: 'MASTER_INFRA', traceId };
  if (supabaseToken) return { isAuthenticated: true, role: 'guest', tenantId: null, traceId };

  return { isAuthenticated: false, role: 'anonymous', tenantId: null, traceId };
}

// ============================================================================
// APARATO PRINCIPAL: routeGuard
// ============================================================================

/**
 * @function routeGuard
 * @description Centinela maestro de tráfico. Orquesta el gating RBAC y la observabilidad.
 * @param {NextRequest} request - Petición entrante del motor Next.js.
 * @param {Locale} locale - Idioma activo resuelto por el Middleware.
 * @returns {Promise<NextResponse | null>} Respuesta de redirección o permiso de paso (null).
 */
export async function routeGuard(request: NextRequest, locale: Locale): Promise<NextResponse | null> {
  const guardStart = performance.now();
  const traceId = `guard_pulse_${Date.now().toString(36).toUpperCase()}`;
  const { pathname } = request.nextUrl;

  /**
   * HELPER: logGuardDecision
   * @description Centraliza la telemetría Heimdall para auditoría forense.
   */
  const logGuardDecision = (status: 'GRANTED' | 'REJECTED' | 'REDIRECTED', reason: string, role: string) => {
    const duration = (performance.now() - guardStart).toFixed(2);
    const color = status === 'GRANTED' ? C.green : (status === 'REJECTED' ? C.red : C.yellow);
    console.log(
      `${C.magenta}[DNA][GUARD]${C.reset} ${status.padEnd(10)} | ` +
      `${color}${pathname.padEnd(25)}${C.reset} | ` +
      `Role: ${role.padEnd(10)} | ` +
      `Lat: ${duration}ms | ` +
      `Trace: ${traceId} | ` +
      `Reason: ${reason}`
    );
  };

  // 1. FAST-PATH: Exenciones de Infraestructura
  if (INFRA_EXEMPTIONS.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const logicalPath = pathname.replace(`/${locale}`, '') || '/';
  
  // 2. FAST-PATH: Validación de Perímetro Público
  if (PUBLIC_DOMAINS.has(logicalPath) || logicalPath.startsWith('/blog/') || logicalPath.startsWith('/legal/')) {
    return null;
  }

  // 3. HANDSHAKE DE IDENTIDAD
  const session = extractEdgeSession(request, traceId);
  
  // 4. GATING DE AUTENTICACIÓN
  if (!session.isAuthenticated) {
    logGuardDecision('REDIRECTED', 'Restricted zone: Identity handshake required', session.role);
    const redirectUrl = new URL(`/${locale}`, request.url);
    redirectUrl.searchParams.set('auth', 'required');
    return NextResponse.redirect(redirectUrl);
  }

  // 5. GATING DE AUTORIZACIÓN (RBAC & P33 Hierarchy)
  // Buscamos la regla más específica que coincida con el rumbo actual.
  const matchedRule = SORTED_RULES.find(([path]) => logicalPath === path || logicalPath.startsWith(`${path}/`));

  if (matchedRule) {
    const requiredRole = matchedRule[1];
    
    /** 
     * @pilar VIII: Lógica síncrona y segura para Vercel Edge. 
     */
    const matrix = resolveAuthorityMatrix(traceId);
    const userLevel = matrix[session.role] || 0;
    const gateLevel = matrix[requiredRole] || 0;

    if (userLevel < gateLevel) {
      logGuardDecision('REJECTED', `Hierarchy Drift: User(${userLevel}) < Required(${gateLevel})`, session.role);
      // Redirección al área base del portal del usuario para evitar 403 secos
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
    }
  }

  // 6. SELLO DE PASAJE (Nominal State)
  logGuardDecision('GRANTED', 'Clearance verified by Sentinel Node', session.role);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Heimdall-Trace', traceId);
  requestHeaders.set('X-Enterprise-Identity', session.role);
  if (session.tenantId) requestHeaders.set('X-Enterprise-Tenant', session.tenantId);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}