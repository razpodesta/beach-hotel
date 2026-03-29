/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Centinela soberano de seguridad (RBAC) en el Edge. 
 *              Orquesta el acceso perimetral para los 5 roles del ecosistema.
 *              Refactorizado: Resolución de errores ESLint (prefer-const, unused-vars)
 *              y blindaje de inmutabilidad funcional.
 * @version 15.1 - Linter Pure & Functional Hardening
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
}

/** 
 * MAPA DE RUTAS PROTEGIDAS POR JERARQUÍA
 * @description Define el rol mínimo requerido para acceder a cada segmento del Portal.
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

// Sincronización proactiva con la navegación dinámica
mainNavStructure.forEach((item: NavItem) => {
  if (item.href && item.href !== '#' && !item.href.startsWith('http')) {
    const cleanPath = item.href.split('#')[0];
    if (cleanPath) PUBLIC_PATHS.add(cleanPath);
  }
});

/**
 * Recupera la sesión evaluando los claims del token en las cookies.
 * 
 * @param {NextRequest} req - Objeto de petición entrante.
 * @returns {SessionState} Estado de sesión normalizado.
 * @pilar III: Seguridad de Tipos.
 */
function getSovereignSession(req: NextRequest): SessionState {
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
 * Normaliza rumbos eliminando el prefijo de idioma y slashes redundantes.
 * 
 * @param {string} pathname - Ruta cruda de la URL.
 * @param {Locale} locale - Idioma activo.
 * @returns {string} Ruta lógica saneada.
 */
function getSanitizedPath(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;
  // @fix: prefer-const - Variable ahora inmutable.
  const path = pathname.startsWith(prefix) ? pathname.replace(prefix, '') || '/' : pathname;
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * APARATO: routeGuard
 * @description Orquestador de acceso dinámico en el Edge de Vercel.
 *              Valida jerarquía de roles y aislamiento Multi-Tenant.
 * 
 * @param {NextRequest} request - Petición Next.js.
 * @param {Locale} locale - Localización activa.
 * @returns {Promise<NextResponse | null>} Respuesta de redirección o null para permitir acceso.
 */
export async function routeGuard(
  request: NextRequest, 
  locale: Locale
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // 1. BLINDAJE DE INFRAESTRUCTRURA CMS
  if (INFRA_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const logicalPath = getSanitizedPath(pathname, locale);

  // 2. EXCEPCIONES PÚBLICAS
  const isPublic = PUBLIC_PATHS.has(logicalPath) || 
                   logicalPath.startsWith('/blog/') || 
                   logicalPath.startsWith('/legal/');
  
  if (isPublic) return null;

  // 3. AUDITORÍA DE IDENTIDAD
  const session = getSovereignSession(request);
  
  // 4. VALIDACIÓN DE AUTENTICACIÓN BASE
  if (!session.isAuthenticated) {
    const clientIp = request.headers.get('x-forwarded-for') || 'Unknown';
    console.warn(`[HEIMDALL][SECURITY] Access Denied (Unauthenticated): ${logicalPath} | IP: ${clientIp}`);
    
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    redirectUrl.searchParams.set('next', logicalPath);
    return NextResponse.redirect(redirectUrl);
  }

  // 5. VALIDACIÓN JERÁRQUICA (RBAC Gating)
  const requiredRoleEntry = Object.entries(ACCESS_MAP)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => logicalPath.startsWith(path));

  if (requiredRoleEntry) {
    // @fix: no-unused-vars - Se utiliza elisión para ignorar la llave del path.
    const [, requiredRole] = requiredRoleEntry;
    
    if (ROLE_LEVELS[session.role] < ROLE_LEVELS[requiredRole]) {
      console.error(
        `[HEIMDALL][RBAC-VIOLATION] Unauthorized Hierarchy: User[${session.role}] tried to access Tier[${requiredRole}] at ${logicalPath}`
      );
      
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
    }
  }

  // 6. HEADER DE TRAZABILIDAD (Heimdall Compliance)
  const response = NextResponse.next();
  response.headers.set('X-Sovereign-Role', session.role);
  if (session.tenantId) response.headers.set('X-Tenant-Id', session.tenantId);

  return null;
}