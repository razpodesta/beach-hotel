/**
 * @file packages/cms/core/src/collections/Users.ts
 * @description Enterprise Identity Cluster (Core Infrastructure).
 *              Orquesta el control de acceso perimetral y la gestión de perfiles.
 *              Implementa RBAC de 5 capas, integración relacional con la 
 *              Red de Alianzas B2B e integridad Multi-Tenant de grado industrial.
 *              Refactorizado: Erradicación del campo 'id' manual para compatibilidad 
 *              con UUID nativo de Payload 3.0.
 * @version 10.0 - Payload Native ID Compliance
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (SSoT)
 */
import { multiTenantReadAccess } from './Access';
import { ROLES_CONFIG } from './users/roles/config';

export const Users: CollectionConfig = {
  slug: 'users',
  
  /**
   * PROTOCOLO DE AUTENTICACIÓN (Infrastructure Security)
   */
  auth: {
    tokenExpiration: 7200, // 2 Horas de sesión activa
    verify: process.env.IS_SEEDING_MODE !== 'true',
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 Minutos de bloqueo por fuerza bruta
    useAPIKey: true,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', 
    },
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'tenant', 'level'],
    group: 'Identity & Access',
    description: 'Gestión centralizada de identidades corporativas y privilegios de acceso.',
  },

  /**
   * REGLAS DE ACCESO (Enterprise RBAC)
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, 
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'developer' || user.role === 'admin') return true;
      return { id: { equals: user.id } };
    },
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Cluster Hooks)
   */
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create') {
          // 1. Garantía de Identidad Multi-Tenant (Relacional)
          // Nota: Si el Seeder inyecta el tenant, lo respetamos.
          if (req.user && !data.tenant) {
            data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
              ? req.user.tenant.id 
              : req.user.tenant;
          }
          
          // 2. Protocolo de Rescate para Genesis Engine (Seeding)
          if (process.env.IS_SEEDING_MODE === 'true') {
            data._verified = true;
          }
        }
        return data;
      },
    ],
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Core Identity',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  unique: true,
                  admin: { width: '50%' }
                },
                {
                  name: 'role',
                  type: 'select',
                  required: true,
                  defaultValue: 'guest',
                  saveToJWT: true,
                  options: ROLES_CONFIG.map(r => ({ label: r.label, value: r.value })),
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'tenant',
              type: 'relationship',
              relationTo: 'tenants',
              required: true,
              saveToJWT: true,
              index: true,
              admin: { 
                position: 'sidebar',
                readOnly: true, 
                description: 'Perímetro físico/digital al que pertenece esta identidad.' 
              },
            },
          ],
        },
        {
          label: 'Authorization Metadata',
          fields: [
            {
              name: 'operatorMetadata',
              type: 'group',
              label: 'Configuración B2B (Agente)',
              admin: {
                condition: (data) => data.role === 'operator',
              },
              fields: [
                { 
                  name: 'agency', 
                  type: 'relationship', 
                  relationTo: 'agencies',
                  required: true,
                  admin: { description: 'Vínculo corporativo con la Red de Alianzas.' }
                },
                { 
                  name: 'accessLevel', 
                  type: 'select', 
                  defaultValue: 'consultant',
                  options: [
                    { label: 'Agency Manager', value: 'manager' },
                    { label: 'Booking Consultant', value: 'consultant' }
                  ]
                },
              ]
            },
            {
              name: 'guestMetadata',
              type: 'group',
              label: 'Preferencias de Operación',
              admin: {
                condition: (data) => data.role === 'guest' || data.role === 'sponsor',
              },
              fields: [
                { name: 'loyaltyPoints', type: 'number', defaultValue: 0 },
                { name: 'preferredLanguage', type: 'text', admin: { placeholder: 'pt-BR' } },
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33 Metrics',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'level', type: 'number', defaultValue: 1, admin: { readOnly: true } },
                { name: 'experiencePoints', type: 'number', defaultValue: 0, admin: { readOnly: true } },
              ],
            },
          ],
        },
      ],
    },
    {
      name: '_verified',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true }
    },
  ],
};