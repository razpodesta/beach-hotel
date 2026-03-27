/**
 * @file packages/cms/core/src/collections/Users.ts
 * @description Colección soberana de identidades y acceso (Access Control).
 *              Implementa arquitectura multitenant, soporte para UUID deterministas
 *              y blindaje contra errores de validación en entornos de CI/CD.
 * @version 6.0 - Pure Source Resolution (No Ext)
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { v4 as uuidv4 } from 'uuid';

/**
 * IMPORTACIONES DE PERÍMETRO (Saneadas)
 * @nivelación: Extensión .js eliminada para alineación con Next.js 15 (Bundler Resolution).
 */
import { multiTenantReadAccess } from './Access';

export const Users: CollectionConfig = {
  slug: 'users',
  
  /**
   * CONFIGURACIÓN DE AUTENTICACIÓN
   * @pilar VIII: Resiliencia - Desactiva la verificación de email en modo Seeding
   * para permitir el arranque inmaculado de la infraestructura.
   */
  auth: {
    tokenExpiration: 7200,
    verify: process.env.IS_SEEDING_MODE !== 'true',
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
    defaultColumns:['email', 'role', 'level', 'tenantId'],
    group: 'System Management',
    description: 'Gestión centralizada de identidades, roles y reputación (P33).',
  },

  /**
   * REGLAS DE ACCESO PERIMETRAL
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, // Permite creación inicial (Genesis); el Middleware protege el resto.
    update: ({ req: { user } }) => user?.role === 'admin' || (!!user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   */
  hooks: {
    beforeChange:[
      ({ data, operation: _operation }) => {
        // Corrección TS6133: Parámetro ignorado con guion bajo
        if (_operation === 'create') {
          if (!data.tenantId) {
            data.tenantId = uuidv4();
          }
          // 2. Protocolo de Rescate: Verificación automática en modo Seeding
          if (process.env.IS_SEEDING_MODE === 'true') {
            data._verified = true;
          }
        }
        return data;
      },
    ],
  },

  fields:[
    {
      name: 'id',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Identificador único de acceso perimetral.' }
    },
    {
        name: '_verified',
        type: 'checkbox',
        defaultValue: false,
        admin: { hidden: true }
    },
    {
      type: 'tabs',
      tabs:[
        {
          label: 'Identidad y Acceso',
          fields:[
            {
              type: 'row',
              fields:[
                {
                  name: 'role',
                  type: 'select',
                  required: true,
                  defaultValue: 'user',
                  saveToJWT: true,
                  options:[
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
                  admin: { 
                    width: '50%', 
                    readOnly: true,
                    description: 'Identificador único de propiedad digital.' 
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Protocolo 33 (Evolución)',
          fields:[
            {
              type: 'row',
              fields:[
                { 
                  name: 'level', 
                  type: 'number', 
                  defaultValue: 1, 
                  admin: { width: '50%', readOnly: true } 
                },
                { 
                  name: 'experiencePoints', 
                  type: 'number', 
                  defaultValue: 0, 
                  admin: { width: '50%', readOnly: true } 
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};