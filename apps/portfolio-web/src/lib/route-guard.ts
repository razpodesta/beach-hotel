/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Enterprise RBAC Orchestrator (Edge Security).
 *              Orquesta el control de acceso perimetral para los 5 niveles
 *              de la jerarquía industrial MetaShark. Implementa Gating
 *              para el Silo B (Partner Network) y auditoría forense.
 * @version 4.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { type Locale } from '../config/i18n.config';
import { mainNavStructure, type NavItem } from './nav-links';

/**
 * MATRIZ DE JERARQUÍA CORPORATIVA (Enterprise RBAC)
 * @description Define el nivel numérico de autoridad para validación de fronteras.
 */
const AUTHORITY_LEVELS = {
  developer: 99, // Root / Infrastructure
  admin: 50,     // Operations Manager
  operator: 30,  // B2B Partner / Agency
  sponsor: 20,   // Elite / VIP
  guest: 10,     // Standard Identity
  anonymous: 0   // Unverified Visitor
} as const;

/**
 * @type EnterpriseRole
 * @description Unión de tipos basada en el registro de autoridad.
 */
export type EnterpriseRole = keyof typeof AUTHORITY_LEVELS;

/**
 * @interface EnterpriseSession
 * @description Contrato inmutable para la identidad detectada en el Edge.
 */
export interface EnterpriseSession {
  isAuthenticated: boolean;
  role: EnterpriseRole;
  tenantId: string | null;
  userId?: string;
  isBypassActive?: boolean;
}

/** 
 * MAPA DE PROTECCIÓN DE RUMBOS (Access Gating)
 * @description Mapeo de prefijos de ruta hacia el nivel de autoridad mínimo requerido.
 */
const PROTECTION_MAP: Record<string, EnterpriseRole> = {
  '/portal/dev': 'developer',
  '/portal/admin': 'admin',
  '/portal/b2b': 'operator',
  '/p/': 'operator',        // <-- GATING PARA RED DE ALIANZAS (Silo B)
  '/portal/vip': 'sponsor',
  '/portal': 'guest',
};

/** 
 * PREFIXES DE INFRAESTRUCTRURA (Exclusión de Gating)
 */
const INFRA_RESOURCES = ['/admin', '/_payload', '/api/payload'];

/** 
 * WHITE-LIST DE ACCESO PÚBLICO
 */
const PUBLIC_INVENTORY = new Set([
  '/', '/login', '/auth/callback', '/contacto', '/blog', 
  '/maintenance', '/quienes-somos', '/mision-y-vision', 
  '/festival', '/subscribe', '/server-error', '/legal'
]);

// Sincronización dinámica de rumbos desde el Navigation Provider
mainNavStructure.forEach((item: NavItem) => {
  if (item.href && item.href !== '#' && !item.href.startsWith('http')) {
    const cleanPath = item.href.split('#')[0];
    if (cleanPath) PUBLIC_INVENTORY.add(cleanPath);
  }
});

/**
 * MODULE: getEnterpriseSession
 * @description Resuelve la identidad evaluando tokens criptográficos o flags de emergencia.
 */
function getEnterpriseSession(req: NextRequest): EnterpriseSession {
  // 1. EVALUACIÓN DE BYPASS TÉCNICO (Modo Desarrollo/Producción Crítica)
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      isAuthenticated: true, 
      role: 'developer', 
      tenantId: '00000000-0000-0000-0000-000000000001',
      userId: 'SYSTEM_ROOT_BYPASS',
      isBypassActive: true
    };
  }

  // 2. EVALUACIÓN DE CREDENCIALES (Persistence Audit)
  const payloadToken = req.cookies.get('payload-token')?.value;
  const supabaseToken = req.cookies.get('sb-access-token')?.value;

  if (payloadToken) {
    return { isAuthenticated: true, role: 'developer', tenantId: 'MASTER_INFRA' };
  }
  
  if (supabaseToken) {
    // @todo: En Fase 4.5, validar JWT mediante auth-shield para extraer rol real
    return { isAuthenticated: true, role: 'guest', tenantId: null };
  }

  return { isAuthenticated: false, role: 'anonymous', tenantId: null };
}

/**
 * HELPER: normalizeEnterprisePath
 */
function normalizeEnterprisePath(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;
  const path = pathname.startsWith(prefix) ? pathname.replace(prefix, '') || '/' : pathname;
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * APARATO: routeGuard
 * @description Sentinel de borde que orquesta el tráfico basado en la identidad verificada.
 */
export async function routeGuard(
  request: NextRequest, 
  locale: Locale
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // 1. BYPASS DE RECURSOS DE SISTEMA
  if (INFRA_RESOURCES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const logicalPath = normalizeEnterprisePath(pathname, locale);
  const isPublicResource = PUBLIC_INVENTORY.has(logicalPath) || 
                          logicalPath.startsWith('/blog/') || 
                          logicalPath.startsWith('/legal/');
  
  if (isPublicResource) return null;

  // 2. AUDITORÍA DE IDENTIDAD (Identity Handshake)
  const session = getEnterpriseSession(request);
  
  /** PROTOCOLO HEIMDALL: Registro de Acceso Directo */
  if (session.isBypassActive) {
    console.info(`[SECURITY][BYPASS] Global Access Granted to ${logicalPath} | Node: ${process.env.VERCEL_REGION || 'local'}`);
  }

  // 3. VALIDACIÓN DE AUTENTICACIÓN (Gate 1)
  if (!session.isAuthenticated) {
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    redirectUrl.searchParams.set('next', logicalPath);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. VALIDACIÓN DE AUTORIDAD (RBAC Gate 2)
  const requiredRoleEntry = Object.entries(PROTECTION_MAP)
    .sort((a, b) => b[0].length - a[0].length) // Prioridad por profundidad de ruta
    .find(([path]) => logicalPath.startsWith(path));

  if (requiredRoleEntry) {
    const [, requiredRole] = requiredRoleEntry;
    
    // Verificación de Jerarquía Numérica
    if (!session.isBypassActive && AUTHORITY_LEVELS[session.role] < AUTHORITY_LEVELS[requiredRole]) {
      console.error(`[RBAC][VIOLATION] Access Denied: Role[${session.role}] attempted to reach Tier[${requiredRole}] at ${logicalPath}`);
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
    }
  }

  // 5. INYECCIÓN DE CABECERAS DE INFRAESTRUCTRURA
  const response = NextResponse.next();
  response.headers.set('X-Enterprise-Identity', session.role);
  if (session.tenantId) response.headers.set('X-Enterprise-Tenant', session.tenantId);
  if (session.isBypassActive) response.headers.set('X-Security-Mode', 'Emergency-Bypass');

  return null;
}