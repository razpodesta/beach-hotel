/**
 * @file packages/cms/core/src/collections/Users.ts
 * @description Colección soberana de identidades y acceso.
 *              Nivelado: Verificación condicional para bootstrapping y 
 *              protección contra errores de validación en modo Seed.
 * @version 3.0 - Genesis-Ready Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { v4 as uuidv4 } from 'uuid';
import { multiTenantReadAccess } from './Access.js';

export const Users: CollectionConfig = {
  slug: 'users',
  /**
   * @description Configuración de Auth resiente.
   * La validación de email se desactiva en modo Seeding para evitar 
   * el bloqueo de 'ValidationError' durante el arranque inicial.
   */
  auth: {
    tokenExpiration: 7200,
    verify: process.env.IS_SEEDING_MODE !== 'true', // Inyecta validación solo en producción
    maxLoginAttempts: 5,
    lockTime: 600000,
    depth: 0,
    useAPIKey: true,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', 
    },
  },
  
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'level', 'tenantId'],
    group: 'System Management',
    description: 'Gestión centralizada de identidades y reputación.',
  },
  
  access: {
    read: multiTenantReadAccess,
    // Permiso total para el Seeder; en producción, el middleware protege el acceso público.
    create: () => true, 
    update: ({ req: { user } }) => user?.role === 'admin' || (!!user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Garantía de Identidad Multi-Tenant
        if (operation === 'create') {
          if (!data.tenantId) {
            data.tenantId = uuidv4();
          }
          // Si estamos sembrando, aseguramos estado verificado
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
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Identificador único de acceso.' }
    },
    // Campo oculto interno para el estado de verificación
    {
        name: '_verified',
        type: 'checkbox',
        defaultValue: false,
        admin: { hidden: true }
    },
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
                  saveToJWT: true,
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
                  required: true,
                  index: true,
                  saveToJWT: true,
                  admin: { width: '50%', description: 'ID de propiedad.', readOnly: true },
                },
              ],
            },
          ],
        },
        {
          label: 'Protocolo 33 (Evolución)',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'level', type: 'number', defaultValue: 1, admin: { width: '50%', readOnly: true } },
                { name: 'experiencePoints', type: 'number', defaultValue: 0, admin: { width: '50%', readOnly: true } },
              ],
            },
          ],
        },
      ],
    },
  ],
};