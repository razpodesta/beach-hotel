/**
 * @file packages/cms/core/src/collections/Users.ts
 * @description Orquestador soberano del Clúster de Identidad. 
 *              Implementa arquitectura modular basada en Responsabilidad Única
 *              para gestionar identidades multi-tenant con RBAC de 5 capas.
 * @version 7.0 - Identity Cluster Standard (Modular Edition)
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { v4 as uuidv4 } from 'uuid';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA Y MODULARIZACIÓN
 * @pilar V: Adherencia arquitectónica.
 */
import { multiTenantReadAccess } from './Access';
import { ROLES_CONFIG } from './users/roles/config'; // Archivo que crearemos a continuación

/**
 * APARATO: Users (Master Identity Collection)
 * @description Centraliza el acceso perimetral y delega la configuración granular
 *              a los módulos de rol específicos.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  
  /**
   * CONFIGURACIÓN DE AUTENTICACIÓN
   * @pilar VIII: Resiliencia de Infraestructura.
   */
  auth: {
    tokenExpiration: 7200,
    verify: process.env.IS_SEEDING_MODE !== 'true',
    maxLoginAttempts: 5,
    lockTime: 600000,
    useAPIKey: true,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', 
    },
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'tenantId', 'level'],
    group: 'Infrastructure',
    description: 'Gestión de Identidades Soberanas y Control de Acceso Perimetral.',
  },

  /**
   * REGLAS DE ACCESO (Sovereign RBAC)
   */
  access: {
    read: multiTenantReadAccess,
    // La creación es abierta para el registro inicial, pero protegida por el Middleware.
    create: () => true,
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'developer' || user.role === 'admin') return true;
      return { id: { equals: user.id } }; // Dueño de su propio perfil
    },
    delete: ({ req: { user } }) => user?.role === 'developer', // Solo Devs eliminan identidades
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks de Clúster)
   */
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          // Garantía de Identidad Multi-Tenant
          if (!data.tenantId) data.tenantId = uuidv4();
          // Protocolo de Rescate para Seeding
          if (process.env.IS_SEEDING_MODE === 'true') data._verified = true;
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
          label: 'Identidad',
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
              name: 'tenantId',
              type: 'text',
              required: true,
              saveToJWT: true,
              index: true,
              admin: { 
                readOnly: true, 
                description: 'Propiedad física/digital a la que pertenece esta identidad.' 
              },
            },
          ],
        },
        /**
         * @description Inyección de Configuraciones Granulares por Rol.
         * En las próximas refactorizaciones, cada objeto 'config' vendrá de su propio archivo.
         */
        {
          label: 'Atributos de Rol',
          fields: [
            {
              name: 'operatorMetadata',
              type: 'group',
              label: 'Configuración Mayorista (B2B)',
              admin: {
                condition: (data) => data.role === 'operator',
              },
              fields: [
                { name: 'agencyName', type: 'text' },
                { name: 'taxId', type: 'text' },
                { name: 'netRatePercentage', type: 'number', defaultValue: 10 },
              ]
            },
            {
              name: 'guestMetadata',
              type: 'group',
              label: 'Preferencia de Huésped',
              admin: {
                condition: (data) => data.role === 'guest',
              },
              fields: [
                { name: 'loyaltyPoints', type: 'number', defaultValue: 0 },
                { name: 'preferredLanguage', type: 'text' },
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33',
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