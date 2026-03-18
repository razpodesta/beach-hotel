/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @description Centinela soberano de seguridad (RBAC) en el Edge. 
 *              Orquesta las reglas de acceso perimetral. Refactorizado para resolver
 *              fricciones de tipado, alias y APIs deprecadas (request.ip).
 * @version 14.2 - Strict Types & Next.js 15 Fixes
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * IMPORTACIONES DE CONTRATO
 * @pilar V: Rutas relativas puras dentro del mismo directorio / src.
 */
import { type Locale } from '../config/i18n.config';
import { mainNavStructure, type NavItem } from './nav-links';

/**
 * @interface SessionState
 * @description Contrato inmutable para el estado de autenticación.
 */
export type SessionState = 
  | { isAuthenticated: false; role: 'guest' }
  | { isAuthenticated: true; role: 'admin' | 'user' | 'sponsor' };

/** 
 * RUTAS CRÍTICAS (Infraestructura)
 */
const CMS_PREFIXES = ['/admin', '/_payload', '/api/payload'];

/** 
 * MEMOIZACIÓN ESTÁTICA DE RUTAS PÚBLICAS
 */
const PUBLIC_BASE_PATHS =[
  '/', 
  '/login', 
  '/auth/callback',
  '/contacto', 
  '/blog', 
  '/maintenance', 
  '/quienes-somos', 
  '/mision-y-vision', 
  '/festival',
  '/subscribe',
  '/server-error'
];

const PUBLIC_PATHS_SET = new Set<string>(PUBLIC_BASE_PATHS);

// Inyección dinámica de la estructura de navegación SSoT
// @fix TS7006: Tipado explícito de 'item' como 'NavItem'
mainNavStructure.forEach((item: NavItem) => {
  if (item.href && item.href !== '#' && !item.href.startsWith('http')) {
    const cleanPath = item.href.split('#')[0];
    if (cleanPath) PUBLIC_PATHS_SET.add(cleanPath);
  }
});

/**
 * @description Normaliza el pathname eliminando el prefijo locale.
 */
function getSanitizedPath(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;
  let path = pathname.startsWith(prefix) ? pathname.replace(prefix, '') || '/' : pathname;
  
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}

/**
 * @description Recupera la sesión evaluando las cookies de persistencia.
 */
function getSovereignSession(req: NextRequest): SessionState {
  const hasPayloadToken = req.cookies.has('payload-token');
  const hasSupabaseToken = req.cookies.has('sb-access-token');

  if (hasPayloadToken) {
    return { isAuthenticated: true, role: 'admin' };
  }
  
  if (hasSupabaseToken) {
    return { isAuthenticated: true, role: 'user' };
  }

  return { isAuthenticated: false, role: 'guest' };
}

/**
 * APARATO: routeGuard
 * @description Orquestador de acceso dinámico.
 */
export async function routeGuard(
  request: NextRequest, 
  locale: Locale
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // 1. BLINDAJE DE INFRAESTRUCTURA CMS
  if (CMS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const logicalPath = getSanitizedPath(pathname, locale);

  // 2. EXCEPCIONES PÚBLICAS Y RUTAS DINÁMICAS
  if (
    PUBLIC_PATHS_SET.has(logicalPath) || 
    logicalPath.startsWith('/legal') || 
    logicalPath.startsWith('/blog/') ||
    logicalPath.startsWith('/servicios/') // Bypass futuro
  ) {
    return null;
  }

  // 3. AUDITORÍA DE SESIÓN
  const session = getSovereignSession(request);
  
  // 4. PROTECCIÓN DE RUTAS PRIVADAS
  if (!session.isAuthenticated) {
    /**
     * @pilar IV: Observabilidad.
     * @fix TS2339: Uso de cabeceras estándar en Next.js Edge en lugar de request.ip
     */
    const clientIp = request.headers.get('x-forwarded-for') || 'Local';
    console.warn(`[HEIMDALL][SECURITY] Acceso Perimetral Denegado: ${logicalPath} | IP: ${clientIp}`);
    
    const redirectUrl = new URL(`/${locale}`, request.url);
    redirectUrl.searchParams.set('unauthorized', 'true');
    return NextResponse.redirect(redirectUrl);
  }

  return null; // Acceso Autorizado
}