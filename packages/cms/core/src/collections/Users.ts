/**
 * @file packages/cms/core/src/collections/Users.ts
 * @description Colección soberana de usuarios (Identidad de Élite).
 *              Integra RBAC, Multi-tenancy y el motor Protocolo 33 mediante Tabs UI.
 * @version 1.5 - Optimized Tabular Architecture (Fix TS2353)
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
/**
 * @pilar V: Adherencia Arquitectónica.
 */
import { multiTenantReadAccess } from './Access';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Seguridad de grado militar para la infraestructura (Pilar VIII)
    tokenExpiration: 7200, // 2 Horas
    verify: true, 
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 Minutos tras bloqueo
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'level', 'tenantId'],
    group: 'System Management',
  },
  
  /**
   * @pilar VIII: Resiliencia en Seguridad.
   * RBAC Centralizado: Solo el Admin Global orquesta la tabla de identidad.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  fields: [
    /**
     * @pilar XII: MEA/UX - Arquitectura por Pestañas.
     * Resolvemos el fallo de tipos de 'collapsible' migrando a una 
     * interfaz tabular profesional y resiliente.
     */
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad y Acceso',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'role',
                  type: 'select',
                  required: true,
                  defaultValue: 'user',
                  options: [
                    { label: 'Administrador Global', value: 'admin' },
                    { label: 'Huésped Boutique', value: 'user' },
                    { label: 'Sponsor / VIP', value: 'sponsor' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'tenantId',
                  type: 'text',
                  index: true,
                  admin: { 
                    width: '50%',
                    description: 'Vinculación de infraestructura (ID de Hotel/Festival).',
                    readOnly: true 
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Protocolo 33 (Gamificación)',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'level',
                  type: 'number',
                  defaultValue: 1,
                  admin: { 
                    width: '50%',
                    readOnly: true,
                    description: 'Nivel jerárquico en el ecosistema.'
                  },
                },
                {
                  name: 'experiencePoints',
                  type: 'number',
                  defaultValue: 0,
                  admin: { 
                    width: '50%',
                    readOnly: true,
                    description: 'Puntos de reputación acumulados.'
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    /**
     * @pilar IV: Observabilidad (Heimdall).
     * Auditoría forense de accesos.
     */
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
};