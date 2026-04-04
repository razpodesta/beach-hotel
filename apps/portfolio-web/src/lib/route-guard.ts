/**
 * @file apps/portfolio-web/src/lib/route-guard.ts
 * @version 6.1 - Edge Performance Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { type Locale } from '../config/i18n.config';
import { mainNavStructure, type NavItem } from './nav-links';

const AUTHORITY_LEVELS = {
  developer: 99,
  admin: 50,
  operator: 30,
  sponsor: 20,
  guest: 10,
  anonymous: 0
} as const;

export type EnterpriseRole = keyof typeof AUTHORITY_LEVELS;

export interface EnterpriseSession {
  isAuthenticated: boolean;
  role: EnterpriseRole;
  tenantId: string | null;
  userId?: string;
  isBypassActive?: boolean;
}

const PROTECTION_MAP: Record<string, EnterpriseRole> = {
  '/portal/dev': 'developer',
  '/portal/admin': 'admin',
  '/portal/b2b': 'operator',
  '/p': 'operator',
  '/portal/vip': 'sponsor',
  '/portal': 'guest',
};

const INFRA_RESOURCES = ['/admin', '/_payload', '/api/payload', '/auth/callback', '/r/'];

const PUBLIC_INVENTORY = new Set([
  '/', '/contacto', '/blog', '/maintenance', '/quienes-somos', 
  '/mision-y-vision', '/festival', '/paquetes', '/subscribe', 
  '/server-error', '/fotos'
]);

// Sincronización proactiva de rutas públicas
mainNavStructure.forEach((item: NavItem) => {
  if (item.href && !item.href.startsWith('http')) {
    PUBLIC_INVENTORY.add(item.href.split('#')[0]);
  }
});

function getEnterpriseSession(req: NextRequest): EnterpriseSession {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { isAuthenticated: true, role: 'developer', tenantId: '00000000-0000-0000-0000-000000000001', userId: 'SYSTEM_ROOT_BYPASS', isBypassActive: true };
  }

  const payloadToken = req.cookies.get('payload-token')?.value;
  const supabaseToken = req.cookies.get('sb-access-token')?.value;

  if (payloadToken) return { isAuthenticated: true, role: 'developer', tenantId: 'MASTER_INFRA' };
  if (supabaseToken) return { isAuthenticated: true, role: 'guest', tenantId: null };

  return { isAuthenticated: false, role: 'anonymous', tenantId: null };
}

export async function routeGuard(request: NextRequest, locale: Locale): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (INFRA_RESOURCES.some((prefix) => pathname.startsWith(prefix))) return null;

  const logicalPath = pathname.replace(`/${locale}`, '') || '/';
  
  if (PUBLIC_INVENTORY.has(logicalPath) || logicalPath.startsWith('/blog/') || logicalPath.startsWith('/legal/')) {
    return null;
  }

  const session = getEnterpriseSession(request);
  
  if (!session.isAuthenticated) {
    const redirectUrl = new URL(`/${locale}`, request.url);
    redirectUrl.searchParams.set('auth', 'required');
    return NextResponse.redirect(redirectUrl);
  }

  const requiredRole = Object.entries(PROTECTION_MAP)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => logicalPath === path || logicalPath.startsWith(`${path}/`))?.[1];

  if (requiredRole && AUTHORITY_LEVELS[session.role] < AUTHORITY_LEVELS[requiredRole]) {
    return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Enterprise-Identity', session.role);
  if (session.tenantId) requestHeaders.set('X-Enterprise-Tenant', session.tenantId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}