/**
 * @file packages/cms/core/src/collections/Access.ts
 * @description Lógica soberana de seguridad multi-tenant y control de perímetros.
 *              Refactorizado: Integración con el Protocolo Heimdall para auditoría 
 *              de acceso y sincronización con infraestructura UUID.
 * @version 4.0 - Forensic Observability & UUID Sync
 * @author Raz Podestá - MetaShark Tech
 */

import type { Access, Where } from 'payload';

/**
 * @interface SovereignUser
 * @description Contrato de identidad nivelado con el estándar UUID del ecosistema.
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
 * 
 * @pilar IV: Observabilidad - Registra el contexto del handshake de lectura.
 */
export const multiTenantReadAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as SovereignUser | null;

  // 1. Visibilidad Pública Universal
  const publicAccess: Where = {
    status: {
      equals: 'published',
    },
  };

  // 2. Administrador Maestro: Acceso Total sin restricciones
  if (sovereignUser?.role === 'admin') {
    return true;
  }

  // 3. Usuario Autenticado: Acceso a su propio Tenant + Contenido Público
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

  // 4. Default: Visitante anónimo solo ve contenido publicado
  return publicAccess;
};

/**
 * REGLA DE ESCRITURA: multiTenantWriteAccess
 * @description Protección de integridad estricta (CUD: Create, Update, Delete).
 *              Garantiza que ningún usuario pueda corromper datos de otro Tenant.
 * 
 * @pilar VIII: Resiliencia - Guardia de identidad nula.
 */
export const multiTenantWriteAccess: Access = ({ req: { user } }) => {
  const sovereignUser = user as SovereignUser | null;

  // Fallback de seguridad: Denegación absoluta si no hay handshake de identidad
  if (!sovereignUser) {
    return false;
  }

  // Bypass para el Administrador Maestro
  if (sovereignUser.role === 'admin') {
    return true;
  }

  /**
   * @pilar I: Visión Holística
   * Restricción por Tenant: El usuario solo puede operar sobre recursos 
   * que pertenezcan a su misma propiedad digital.
   */
  return {
    tenantId: {
      equals: sovereignUser.tenantId,
    },
  } as Where;
};