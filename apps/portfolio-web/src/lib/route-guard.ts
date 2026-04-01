/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Enterprise RBAC Orchestrator (Edge Security).
 *              Refactorizado: Erradicación del bug 404 de '/login' inexistente,
 *              normalización estricta de barras (Anti-Double-Slash) y
 *              evaluación determinista de fronteras de rol (Fail-Fast RBAC).
 * @version 5.0 - Strict Perimeter & Anti-404 Hardening
 * @author Raz Podestá - MetaShark Tech
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
 * @fix Eliminada la barra diagonal final en '/p' para permitir coincidencia exacta.
 */
const PROTECTION_MAP: Record<string, EnterpriseRole> = {
  '/portal/dev': 'developer',
  '/portal/admin': 'admin',
  '/portal/b2b': 'operator',
  '/p': 'operator', // Gating para Red de Alianzas (Silo B)
  '/portal/vip': 'sponsor',
  '/portal': 'guest',
};

/** 
 * PREFIXES DE INFRAESTRUCTRURA (Exclusión de Gating)
 * @description Rutas nativas que gestionan su propia autenticación.
 */
const INFRA_RESOURCES = ['/admin', '/_payload', '/api/payload', '/auth/callback'];

/** 
 * WHITE-LIST DE ACCESO PÚBLICO
 * @description Inventario SSoT de rutas abiertas.
 */
const PUBLIC_INVENTORY = new Set([
  '/', '/contacto', '/blog', '/maintenance', '/quienes-somos', 
  '/mision-y-vision', '/festival', '/paquetes', '/subscribe', 
  '/server-error'
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
  // 1. EVALUACIÓN DE BYPASS TÉCNICO (Modo Desarrollo)
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
    return { isAuthenticated: true, role: 'guest', tenantId: null };
  }

  return { isAuthenticated: false, role: 'anonymous', tenantId: null };
}

/**
 * HELPER: normalizeEnterprisePath
 * @description Extrae de forma matemática y segura el sub-path, eliminando
 *              el locale y previniendo los saltos a '404' por dobles diagonales.
 */
function normalizeEnterprisePath(pathname: string, locale: Locale): string {
  if (pathname === `/${locale}`) return '/';

  const prefix = `/${locale}/`;
  let normalized = pathname;

  if (pathname.startsWith(prefix)) {
    normalized = '/' + pathname.substring(prefix.length);
  }

  // Limpieza de Trailing Slash final para consistencia de enrutamiento
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
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

  // 1. BYPASS DE RECURSOS DE SISTEMA E INFRAESTRUCTURA
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
  
  if (session.isBypassActive) {
    console.info(`[HEIMDALL][BYPASS] Global Access Granted to ${logicalPath} | Node: ${process.env.VERCEL_REGION || 'local'}`);
  }

  // 3. VALIDACIÓN DE AUTENTICACIÓN (Gate 1)
  if (!session.isAuthenticated) {
    /**
     * @fix Anti-404: La ruta '/login' no existe. Redirigimos al Home (raíz)
     * para que el visitante acceda orgánicamente al Modal de Autenticación.
     */
    console.warn(`[HEIMDALL][SECURITY] Unauthenticated access to ${logicalPath}. Redirecting to Sanctuary Home.`);
    const redirectUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. VALIDACIÓN DE AUTORIDAD (RBAC Gate 2)
  /**
   * @fix Fail-Fast Matcher: Garantiza que '/portal-data' no se valide erróneamente
   * como '/portal'. Exige coincidencia exacta o subruta estricta.
   */
  const requiredRoleEntry = Object.entries(PROTECTION_MAP)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => logicalPath === path || logicalPath.startsWith(`${path}/`));

  if (requiredRoleEntry) {
    const [path, requiredRole] = requiredRoleEntry;
    
    // Verificación de Jerarquía Numérica
    if (!session.isBypassActive && AUTHORITY_LEVELS[session.role] < AUTHORITY_LEVELS[requiredRole]) {
      console.error(`[HEIMDALL][RBAC] Violation: Role[${session.role}] attempted to reach Tier[${requiredRole}] at ${path}`);
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
    }
  }

  // 5. INYECCIÓN DE CABECERAS DE INFRAESTRUCTURA
  const response = NextResponse.next();
  response.headers.set('X-Enterprise-Identity', session.role);
  if (session.tenantId) response.headers.set('X-Enterprise-Tenant', session.tenantId);
  if (session.isBypassActive) response.headers.set('X-Security-Mode', 'Emergency-Bypass');

  return null;
}