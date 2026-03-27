/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Orquestador Soberano de Seguridad Multi-Tenant y Perímetros de Datos.
 *              Implementa el Protocolo Heimdall para auditoría de acceso y 
 *              blindaje de integridad E-E-A-T.
 * @version 5.0 - Forensic Observability & Strict Type Guarding
 * @author Raz Podestá - MetaShark Tech
 */

import type { Access, Where } from 'payload';

/**
 * @type SovereignUser
 * @description Definición estricta de la identidad operativa dentro del CMS.
 * @pilar III: Seguridad de Tipos - Alineado con el contrato de Users.ts.
 */
type SovereignUser = {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'sponsor';
  tenantId?: string;
};

/**
 * REGLA DE LECTURA: multiTenantReadAccess
 * @description Orquesta la visibilidad con precisión matemática:
 * - Publicados: Visible para todos (Pilar I: SEO & Alcance).
 * - Privados: Solo visibles para el Administrador o miembros del mismo Tenant.
 * 
 * @pilar IV: Observabilidad - Trazabilidad del handshake de lectura.
 */
export const multiTenantReadAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as unknown as SovereignUser | null;

  // 1. Visibilidad Pública Universal (Contenido listo para producción)
  const publicFilter: Where = {
    status: {
      equals: 'published',
    },
  };

  // 2. Administrador Maestro: Acceso Total (Bypass de Perímetro)
  if (sovereignUser?.role === 'admin') {
    return true;
  }

  // 3. Usuario Autenticado: Acceso a su propio Tenant + Contenido Público
  if (sovereignUser?.tenantId && typeof sovereignUser.tenantId === 'string') {
    return {
      or: [
        publicFilter,
        {
          tenantId: {
            equals: sovereignUser.tenantId,
          },
        },
      ],
    } as Where;
  }

  // 4. Default: Visitante anónimo o sin Tenant (Solo contenido publicado)
  return publicFilter;
};

/**
 * REGLA DE ESCRITURA: multiTenantWriteAccess
 * @description Protección de integridad estricta (CUD: Create, Update, Delete).
 *              Garantiza la soberanía de los datos por propiedad digital.
 * 
 * @pilar VIII: Resiliencia - Guardia de identidad nula con Fail-Fast.
 */
export const multiTenantWriteAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as unknown as SovereignUser | null;

  // Handshake Fallido: Denegación absoluta si no hay identidad verificada.
  if (!sovereignUser) {
    return false;
  }

  // Administrador Maestro: Autoridad total sobre la infraestructura.
  if (sovereignUser.role === 'admin') {
    return true;
  }

  /**
   * @pilar I: Visión Holística - Aislamiento Multi-Tenant.
   * El usuario solo puede modificar recursos vinculados a su propia identidad de tenant.
   */
  if (sovereignUser.tenantId) {
    return {
      tenantId: {
        equals: sovereignUser.tenantId,
      },
    } as Where;
  }

  // Fallback: Si el usuario existe pero no tiene tenant asignado, denegar escritura.
  console.warn(`[HEIMDALL][SECURITY] Access Denied: User ${sovereignUser.id} lacks a valid Tenant ID.`);
  return false;
};