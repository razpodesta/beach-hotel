/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Lógica soberana de seguridad multi-tenant.
 *              Refactorizada para garantizar visibilidad pública y aislamiento privado.
 * @version 3.2 - Security & Performance Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import { type Access, type Where } from 'payload';

/**
 * CONTRATO DE USUARIO SOBERANO
 */
interface SovereignUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'sponsor';
  tenantId?: string;
}

/**
 * REGLA DE LECTURA: multiTenantReadAccess
 * @description Orquesta la visibilidad con precisión matemática:
 * - Publicados: Visible para todos (incluyendo anónimos).
 * - Privados: Solo visibles para el Admin o miembros del mismo Tenant.
 */
export const multiTenantReadAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as SovereignUser | null;

  // 1. Visibilidad Pública: Todos pueden leer publicaciones
  const publicAccess: Where = {
    status: {
      equals: 'published',
    },
  };

  // 2. Administrador Maestro: Acceso Total
  if (sovereignUser?.role === 'admin') {
    return true;
  }

  // 3. Usuario Autenticado (No Admin): Publicados + Privados de su propio Tenant
  if (sovereignUser?.tenantId) {
    return {
      or: [
        publicAccess,
        {
          tenantId: {
            equals: sovereignUser.tenantId,
          },
        },
      ],
    } as Where;
  }

  // 4. Default: Solo público
  return publicAccess;
};

/**
 * REGLA DE ESCRITURA: multiTenantWriteAccess
 * @description Protección de integridad estricta.
 */
export const multiTenantWriteAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as SovereignUser | null;

  // Acceso denegado para no autenticados
  if (!sovereignUser) return false;

  // Bypass para Admin
  if (sovereignUser.role === 'admin') return true;

  // Restricción por Tenant: Solo permite escribir en recursos propios
  return {
    tenantId: {
      equals: sovereignUser.tenantId,
    },
  } as Where;
};