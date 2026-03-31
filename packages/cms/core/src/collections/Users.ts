/**
 * @file packages/cms/core/src/collections/Users.ts
 * @description Enterprise Identity Cluster (Core Infrastructure).
 *              Orquesta el control de acceso perimetral y la gestión de perfiles.
 *              Implementa RBAC de 5 capas, integración relacional con la 
 *              Red de Alianzas B2B e integridad Multi-Tenant de grado industrial.
 * @version 9.0 - Enterprise Level 4.0 | Relational Integrity Sync
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { v4 as uuidv4 } from 'uuid';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (SSoT)
 * @pilar V: Adherencia arquitectónica.
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
    group: 'Identity & Access', // Nivelación Léxica
    description: 'Gestión centralizada de identidades corporativas y privilegios de acceso.',
  },

  /**
   * REGLAS DE ACCESO (Enterprise RBAC)
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, // El registro inicial es abierto, el Middleware gestiona el Gating
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'developer' || user.role === 'admin') return true;
      return { id: { equals: user.id } }; // Restricción de auto-edición
    },
    delete: ({ req: { user } }) => user?.role === 'developer', // Privilegio exclusivo de Infraestructura
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Cluster Hooks)
   */
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          // 1. Garantía de Identidad Multi-Tenant
          if (!data.tenant) data.tenant = uuidv4();
          
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
      name: 'id',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true }
    },
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
              /**
               * @property tenant
               * @description Relación inmutable con la propiedad propietaria.
               */
              name: 'tenant',
              type: 'relationship',
              relationTo: 'tenants',
              required: true,
              saveToJWT: true,
              index: true,
              admin: { 
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
                  /**
                   * @property agency
                   * @fix: Sustituidos campos de texto por Relación Estricta.
                   * Asegura que el usuario operador pertenezca a una agencia válida.
                   */
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