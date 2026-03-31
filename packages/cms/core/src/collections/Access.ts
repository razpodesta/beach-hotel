/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Orquestador Soberano de Seguridad Multi-Tenant.
 *              Refactorizado: Sincronización con el campo relacional 'tenant',
 *              blindaje de tipos para RBAC de 5 capas y aislamiento de datos.
 * @version 7.0 - Sovereign Tenant Security & Zero Drift
 * @author Raz Podestá - MetaShark Tech
 */

import type { Access, Where } from 'payload';

/**
 * @interface SovereignUser
 * @description Contrato de identidad para operaciones del CMS.
 *              Nivelado: 'tenant' sustituye a 'tenantId' para integridad relacional.
 */
interface SovereignUser {
  id: string;
  email: string;
  role: 'developer' | 'admin' | 'operator' | 'sponsor' | 'guest';
  /** El tenant puede venir como ID (string) o como objeto poblado */
  tenant?: string | { id: string } | null;
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
  // 1. Root Developer & Admin: Acceso Total
  if (isSovereignUser(user) && (user.role === 'admin' || user.role === 'developer')) {
    return true;
  }

  // 2. Filtro Público (Contenido listo para producción)
  const publicFilter: Where = {
    status: {
      equals: 'published',
    },
  };

  // 3. Usuario con Identidad de Propiedad (Tenant)
  if (isSovereignUser(user) && user.tenant) {
    const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant;

    return {
      or: [
        publicFilter,
        {
          tenant: {
            equals: tenantId,
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

  // Bypass para rangos superiores
  if (user.role === 'admin' || user.role === 'developer') {
    return true;
  }

  // Aislamiento por Propiedad (Tenant)
  if (user.tenant) {
    const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant;

    return {
      tenant: {
        equals: tenantId,
      },
    } as Where;
  }

  /**
   * ALERTA DE SEGURIDAD (Heimdall Protocol)
   * Usuario autenticado intentando escribir sin vínculo de propiedad.
   */
  console.error(`[HEIMDALL][SECURITY-BREACH] Access Denied: User ${user.email} lacks Sovereign Tenant at ${url}`);
  return false;
};

/**
 * REGLA EXCLUSIVA: adminOnly
 * @description Reserva el acceso estrictamente a la jerarquía raíz.
 */
export const adminOnly: Access = ({ req: { user } }) => {
  return isSovereignUser(user) && (user.role === 'admin' || user.role === 'developer');
};