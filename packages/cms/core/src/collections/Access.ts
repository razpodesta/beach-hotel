/**
 * @file access.ts
 * @description Lógica soberana de seguridad multi-tenant.
 *              Refactorizada para cumplimiento estricto de tipos de Payload 3.0.
 * @author Raz Podestá - MetaShark Tech
 */

import { type Access, type Where } from 'payload';

/**
 * Control de Lectura:
 * Utiliza casting explícito a 'Where' para cumplir con la firma de AccessResult.
 */
export const multiTenantReadAccess: Access = ({ req: { user } }) => {
  // Público: Solo ve proyectos publicados.
  if (!user) {
    return {
      status: {
        equals: 'published',
      },
    };
  }

  // Admin global puede ver todo.
  if (user.role === 'admin') return true;

  // Usuario: Ve los publicados + TODOS los pertenecientes a su Tenant.
  return {
    or: [
      {
        status: {
          equals: 'published',
        },
      },
      {
        tenantId: {
          equals: user.tenantId,
        },
      },
    ],
  } as Where;
};

/**
 * Control de Escritura/Modificación:
 * El usuario solo puede alterar documentos que coincidan con su propio Tenant.
 */
export const multiTenantWriteAccess: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  return {
    tenantId: {
      equals: user.tenantId,
    },
  } as Where;
};