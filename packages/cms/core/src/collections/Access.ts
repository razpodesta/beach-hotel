/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Orquestador Soberano de Seguridad Multi-Tenant.
 *              Implementa aislamiento de datos, visibilidad condicional E-E-A-T
 *              y blindaje contra fallos de esquema (Pilar VIII).
 * @version 6.0 - Shielded Multi-Tenancy & Type Guards
 * @author Raz Podestá - MetaShark Tech
 */

import type { Access, Where } from 'payload';

/**
 * @interface SovereignUser
 * @description Contrato de identidad para operaciones del CMS.
 */
interface SovereignUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'sponsor';
  tenantId?: string;
}

/**
 * TYPE GUARD: isSovereignUser
 * @pilar III: Seguridad de Tipos Absoluta.
 */
const isSovereignUser = (user: unknown): user is SovereignUser => {
  return (
    user !== null &&
    typeof user === 'object' &&
    'id' in user &&
    'role' in user
  );
};

/**
 * REGLA DE LECTURA: multiTenantReadAccess
 * @description Orquesta la visibilidad basada en el estado del contenido y pertenencia.
 */
export const multiTenantReadAccess: Access = ({ req: { user } }) => {
  // 1. Administrador Maestro: Acceso Total
  if (isSovereignUser(user) && user.role === 'admin') {
    return true;
  }

  // 2. Filtro Público (Contenido listo para producción)
  // Nota: Payload manejará internamente si la colección no posee el campo 'status'
  const publicFilter: Where = {
    status: {
      equals: 'published',
    },
  };

  // 3. Usuario con Identidad de Tenant
  if (isSovereignUser(user) && user.tenantId) {
    return {
      or: [
        publicFilter,
        {
          tenantId: {
            equals: user.tenantId,
          },
        },
      ],
    } as Where;
  }

  // 4. Default: Visitantes anónimos solo ven lo publicado
  return publicFilter;
};

/**
 * REGLA DE ESCRITURA: multiTenantWriteAccess
 * @description Restringe la creación, edición y borrado al propietario del Tenant.
 * @pilar IV: Observabilidad (Heimdall) - Registra violaciones de perímetro.
 */
export const multiTenantWriteAccess: Access = ({ req: { user, url } }) => {
  if (!isSovereignUser(user)) {
    return false;
  }

  // Bypass para el Administrador Maestro
  if (user.role === 'admin') {
    return true;
  }

  // Aislamiento por Tenant
  if (user.tenantId) {
    return {
      tenantId: {
        equals: user.tenantId,
      },
    } as Where;
  }

  /**
   * ALERTA DE SEGURIDAD (Heimdall Protocol)
   * Usuario autenticado intentando escribir sin ID de propiedad.
   */
  console.error(`[HEIMDALL][SECURITY-BREACH] Access Denied: User ${user.email} lacks TenantID at ${url}`);
  return false;
};

/**
 * REGLA EXCLUSIVA: adminOnly
 * @description Reserva el acceso estrictamente a la identidad raíz.
 */
export const adminOnly: Access = ({ req: { user } }) => {
  return isSovereignUser(user) && user.role === 'admin';
};