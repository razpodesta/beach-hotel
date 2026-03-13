/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Lógica soberana de seguridad multi-tenant para el ecosistema CMS.
 *              Implementa control de acceso basado en roles (RBAC) e identidad de Tenant.
 * @version 3.1 - Type-Safe Security Architecture
 * @author Raz Podestá - MetaShark Tech
 */

import { type Access, type Where } from 'payload';

/**
 * CONTRATO DE USUARIO SOBERANO
 * @pilar III: Seguridad de Tipos Absoluta.
 * Extendemos la definición de usuario para incluir las métricas de identidad del Monorepo.
 */
interface SovereignUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'sponsor';
  tenantId?: string;
}

/**
 * REGLA DE LECTURA: multiTenantReadAccess
 * @description Orquesta la visibilidad de documentos. 
 *              Público -> Solo publicados.
 *              Admin -> Todo.
 *              User -> Publicados + Propiedad del Tenant.
 */
export const multiTenantReadAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as SovereignUser | null;

  // 1. Caso: Visitante Anónimo (Pilar VIII: Resiliencia)
  if (!sovereignUser) {
    return {
      status: {
        equals: 'published',
      },
    };
  }

  // 2. Caso: Administrador Maestro (Visión Total)
  if (sovereignUser.role === 'admin') {
    return true;
  }

  // 3. Caso: Usuario Localizado (Privacidad por Tenant)
  if (sovereignUser.tenantId) {
    return {
      or: [
        {
          status: {
            equals: 'published',
          },
        },
        {
          tenantId: {
            equals: sovereignUser.tenantId,
          },
        },
      ],
    } as Where;
  }

  // Fallback de seguridad: Solo lo publicado
  return {
    status: {
      equals: 'published',
    },
  };
};

/**
 * REGLA DE ESCRITURA: multiTenantWriteAccess
 * @description Protege la integridad de los datos. 
 *              Garantiza que nadie pueda modificar activos ajenos a su Tenant.
 */
export const multiTenantWriteAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as SovereignUser | null;

  // @pilar VIII: Bloqueo inmediato para anónimos
  if (!sovereignUser) return false;

  // Superuser bypass
  if (sovereignUser.role === 'admin') return true;

  // @pilar V: Restricción estricta de frontera de datos
  if (sovereignUser.tenantId) {
    return {
      tenantId: {
        equals: sovereignUser.tenantId,
      },
    } as Where;
  }

  return false;
};