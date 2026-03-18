/**
 * @file Users.ts
 * @description Colección soberana de identidades y acceso (Fortaleza de Identidad).
 *              Gestiona el RBAC, la gobernanza Multi-Tenant y el motor de 
 *              gamificación Protocolo 33.
 * @version 2.1 - Case-Sensitive Cookie Fix (TS2820)
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { v4 as uuidv4 } from 'uuid';
import { multiTenantReadAccess } from './Access.js';

export const Users: CollectionConfig = {
  slug: 'users',
  /**
   * @description Configuración de Autenticación de Élite.
   * @pilar III: Seguridad de Tipos Absoluta.
   */
  auth: {
    tokenExpiration: 7200, // 2 horas
    verify: true,          // Verificación de identidad obligatoria
    maxLoginAttempts: 5,
    lockTime: 600000,
    depth: 0,
    useAPIKey: true,
    /**
     * @pilar VIII: Resiliencia de Sesión.
     * @fix TS2820: Normalización de Mayúsculas en SameSite.
     */
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
  
  /**
   * REGLAS DE ACCESO (RBAC)
   * @pilar III: Solo los administradores pueden gestionar el ecosistema.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin' || (!!user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   * @pilar IV: Observabilidad de eventos de identidad.
   */
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Garantía de Identidad Multi-Tenant para nuevos registros
        if (operation === 'create' && !data.tenantId) {
          data.tenantId = uuidv4();
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`[HEIMDALL][AUTH] New Sovereign Identity: ${doc.email} | Tenant: ${doc.tenantId}`);
        }
      }
    ]
  },

  fields: [
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
                  saveToJWT: true, // Expone el rol al route-guard.ts
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
                  saveToJWT: true, // Expone el ID de propiedad al middleware
                  admin: { 
                    width: '50%',
                    description: 'Identificador único de propiedad digital.',
                    readOnly: true 
                  },
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
                {
                  name: 'level',
                  type: 'number',
                  defaultValue: 1,
                  min: 1,
                  admin: { 
                    width: '50%',
                    readOnly: true,
                    description: 'Nivel jerárquico del usuario.'
                  },
                },
                {
                  name: 'experiencePoints',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  admin: { 
                    width: '50%',
                    readOnly: true,
                    description: 'Puntos de experiencia acumulados.'
                  },
                },
              ],
            },
          ],
        },
      ],
    },
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