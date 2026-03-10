// RUTA: apps/portfolio-web/src/lib/route-guard.ts

/**
 * @file Guardián de Rutas (Middleware Logic)
 * @version 8.0 - CMS Integration & RBAC Ready
 * @description Maneja la protección de rutas, RBAC y normalización de URLs.
 *              Esta versión está optimizada para convivir con Payload CMS 3.0.
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';
import { type Locale } from '../config/i18n.config';

/**
 * Definición de roles soberanos.
 */
type UserRole = 'user' | 'admin' | 'guest';

interface Session {
  isAuthenticated: boolean;
  role: UserRole;
}

// ============================================================================
// CONFIGURACIÓN DE ACCESO
// ============================================================================

const PUBLIC_PATHS = [
  '/', 
  '/login', 
  '/quien-soy', 
  '/mision-y-vision', 
  '/contacto', 
  '/blog', 
  '/servicios', 
  '/festival',
  '/legal',
  '/maintenance'
];

const ADMIN_PATH = '/admin'; // Ruta protegida de Payload CMS

// ============================================================================
// LÓGICA DE GUARDIÁN
// ============================================================================

/**
 * Orquesta la seguridad en el Edge.
 */
export function routeGuard(request: NextRequest, locale: Locale): NextResponse | null {
  const { pathname } = request.nextUrl;
  
  // 1. Normalización: Eliminamos el locale para evaluar la ruta lógica
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  // 2. Bypass de Rutas Públicas
  // Si la ruta lógica es pública, permitimos el acceso sin evaluar sesión.
  if (PUBLIC_PATHS.some((p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`))) {
    return null;
  }

  // 3. Simulación de Sesión (Integrable con Supabase SSR en Middleware)
  const session: Session = {
    isAuthenticated: false,
    role: 'guest'
  };

  // 4. Protección de Rutas Administrativas (Payload CMS Admin)
  if (pathWithoutLocale.startsWith(ADMIN_PATH)) {
    if (!session.isAuthenticated || session.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return null;
}