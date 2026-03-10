// RUTA: apps/portfolio-web/src/lib/route-guard.ts
// VERSIÓN: 9.0 - Arquitectura de Seguridad Edge
// DESCRIPCIÓN: Guardián de rutas optimizado con normalización eficiente 
//              y contrato de sesión estricto.

import { NextResponse, type NextRequest } from 'next/server';
import { type Locale } from '../config/i18n.config';

type UserRole = 'user' | 'admin' | 'guest';

interface Session {
  isAuthenticated: boolean;
  role: UserRole;
}

// Configuración centralizada de acceso
const PUBLIC_PATHS = new Set([
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
]);

const ADMIN_PATH = '/admin';

/**
 * Normaliza la ruta eliminando el prefijo de idioma para validación lógica.
 * Utiliza una lógica de string puro en lugar de RegExp costosas.
 */
function getLogicalPath(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return '/';
  return pathname.startsWith(prefix) ? pathname.replace(prefix, '') : pathname;
}

/**
 * Orquesta la seguridad en el Edge.
 */
export function routeGuard(request: NextRequest, locale: Locale): NextResponse | null {
  const { pathname } = request.nextUrl;
  const pathWithoutLocale = getLogicalPath(pathname, locale);
  
  // 1. Bypass eficiente usando Set.has()
  if (PUBLIC_PATHS.has(pathWithoutLocale)) {
    return null;
  }

  // 2. Integración de Sesión (Supabase SSR)
  // Nota: En una implementación real, aquí leerías la cookie de sesión de Supabase.
  const session: Session = {
    isAuthenticated: false, // Placeholder
    role: 'guest'
  };

  // 3. Protección de Rutas Administrativas
  if (pathWithoutLocale.startsWith(ADMIN_PATH)) {
    if (!session.isAuthenticated || session.role !== 'admin') {
      // Retornamos la redirección formateada para el locale actual
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return null;
}