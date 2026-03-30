/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Centinela soberano de seguridad (RBAC) en el Edge. 
 *              Orquesta el acceso perimetral para los 5 roles del ecosistema.
 *              Refactorizado: Implementación de Protocolo de Bypass para Desarrollo (Ghost Admin),
 *              resolución de bloqueos perimetrales y trazabilidad forense Heimdall.
 * @version 16.0 - Auth Bypass & Sovereign Access
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica a fronteras Nx.
 */
import { type Locale } from '../config/i18n.config';
import { mainNavStructure, type NavItem } from './nav-links';

/**
 * MATRIZ DE PODER SOBERANA (SSoT)
 * @description Define el nivel numérico de cada rol para comparaciones de jerarquía.
 */
const ROLE_LEVELS = {
  developer: 99, // Root Access
  admin: 50,     // Hotel Manager
  operator: 30,  // Wholesale / B2B
  sponsor: 20,   // Elite Guest
  guest: 10,     // Standard Guest
  anonymous: 0   // Visitor
} as const;

/**
 * @type SovereignRole
 * @description Unión de tipos basada en las llaves de la matriz de niveles.
 */
export type SovereignRole = keyof typeof ROLE_LEVELS;

/**
 * @interface SessionState
 * @description Contrato inmutable para la identidad detectada en el perímetro.
 */
export interface SessionState {
  isAuthenticated: boolean;
  role: SovereignRole;
  tenantId: string | null;
  userId?: string;
  isBypass?: boolean; // Trazabilidad de acceso sintético
}

/** 
 * MAPA DE RUTAS PROTEGIDAS POR JERARQUÍA
 */
const ACCESS_MAP: Record<string, SovereignRole> = {
  '/portal/dev': 'developer',
  '/portal/admin': 'admin',
  '/portal/b2b': 'operator',
  '/portal/vip': 'sponsor',
  '/portal': 'guest',
};

/** 
 * RUTAS CRÍTICAS DE INFRAESTRUCTRURA (Bypass total)
 */
const INFRA_PREFIXES = ['/admin', '/_payload', '/api/payload'];

/** 
 * REGISTRO DE RUTAS PÚBLICAS (Whitelisting)
 */
const PUBLIC_PATHS = new Set([
  '/', '/login', '/auth/callback', '/contacto', '/blog', 
  '/maintenance', '/quienes-somos', '/mision-y-vision', 
  '/festival', '/subscribe', '/server-error', '/legal'
]);

mainNavStructure.forEach((item: NavItem) => {
  if (item.href && item.href !== '#' && !item.href.startsWith('http')) {
    const cleanPath = item.href.split('#')[0];
    if (cleanPath) PUBLIC_PATHS.add(cleanPath);
  }
});

/**
 * Recupera la sesión evaluando tokens o flags de bypass.
 * @pilar VIII: Resiliencia - Permite el acceso universal si la variable de entorno está activa.
 */
function getSovereignSession(req: NextRequest): SessionState {
  // 1. EVALUACIÓN DE BYPASS (Modo Emergencia/Desarrollo)
  const isBypassActive = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
  
  if (isBypassActive) {
    return { 
      isAuthenticated: true, 
      role: 'developer', 
      tenantId: '00000000-0000-0000-0000-000000000001', // Master Tenant Genesis
      userId: 'BYPASS_ADMIN',
      isBypass: true
    };
  }

  // 2. EVALUACIÓN ESTÁNDAR (Cookies)
  const payloadToken = req.cookies.get('payload-token')?.value;
  const supabaseToken = req.cookies.get('sb-access-token')?.value;

  if (payloadToken) {
    return { isAuthenticated: true, role: 'developer', tenantId: 'SYSTEM_ROOT' };
  }
  
  if (supabaseToken) {
    return { isAuthenticated: true, role: 'guest', tenantId: null };
  }

  return { isAuthenticated: false, role: 'anonymous', tenantId: null };
}

/**
 * Normaliza rumbos eliminando el prefijo de idioma.
 */
function getSanitizedPath(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;
  const path = pathname.startsWith(prefix) ? pathname.replace(prefix, '') || '/' : pathname;
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * APARATO: routeGuard
 * @description Orquestador de acceso dinámico en el Edge de Vercel.
 */
export async function routeGuard(
  request: NextRequest, 
  locale: Locale
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (INFRA_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const logicalPath = getSanitizedPath(pathname, locale);
  const isPublic = PUBLIC_PATHS.has(logicalPath) || 
                   logicalPath.startsWith('/blog/') || 
                   logicalPath.startsWith('/legal/');
  
  if (isPublic) return null;

  // AUDITORÍA DE IDENTIDAD
  const session = getSovereignSession(request);
  
  // LOG DE TELEMETRÍA HEIMDALL
  if (session.isBypass) {
    console.info(`[HEIMDALL][SECURITY] Global Access Granted via BYPASS_MODE: ${logicalPath}`);
  }

  // VALIDACIÓN DE AUTENTICACIÓN
  if (!session.isAuthenticated) {
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    redirectUrl.searchParams.set('next', logicalPath);
    return NextResponse.redirect(redirectUrl);
  }

  // VALIDACIÓN JERÁRQUICA (RBAC)
  const requiredRoleEntry = Object.entries(ACCESS_MAP)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => logicalPath.startsWith(path));

  if (requiredRoleEntry) {
    const [, requiredRole] = requiredRoleEntry;
    
    // Si no es bypass y no tiene nivel, bloqueamos.
    if (!session.isBypass && ROLE_LEVELS[session.role] < ROLE_LEVELS[requiredRole]) {
      console.error(`[HEIMDALL][RBAC] Unauthorized: User[${session.role}] -> Tier[${requiredRole}] at ${logicalPath}`);
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Sovereign-Role', session.role);
  if (session.tenantId) response.headers.set('X-Tenant-Id', session.tenantId);
  if (session.isBypass) response.headers.set('X-Auth-Status', 'Bypass-Active');

  return null;
}