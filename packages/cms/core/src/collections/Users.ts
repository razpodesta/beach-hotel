/**
 * @file packages/cms/core/src/collections/Users.ts
 * @description Colección soberana de identidades y acceso.
 *              Refactorizado: Implementación de ID tipo Texto para soporte de UUID 
 *              y compatibilidad con infraestructuras distribuidas.
 * @version 4.0 - UUID Standard & Auth Resilience
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { v4 as uuidv4 } from 'uuid';
import { multiTenantReadAccess } from './Access.js';

export const Users: CollectionConfig = {
  slug: 'users',
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
    defaultColumns: ['email', 'role', 'level', 'tenantId'],
    group: 'System Management',
  },
  access: {
    read: multiTenantReadAccess,
    create: () => true, 
    update: ({ req: { user } }) => user?.role === 'admin' || (!!user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          if (!data.tenantId) {
            data.tenantId = uuidv4();
          }
          if (process.env.IS_SEEDING_MODE === 'true') {
            data._verified = true;
          }
        }
        return data;
      },
    ],
  },
  fields: [
    /* 
       PILAR I: VISIÓN HOLÍSTICA
       Forzamos el ID como texto para permitir el uso de UUIDs y evitar 
       el error de transpilación 'serial' en PostgreSQL remoto.
    */
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
    },
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
                  admin: { width: '50%', readOnly: true },
                },
              ],
            },
          ],
        },
        {
          label: 'Protocolo 33',
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