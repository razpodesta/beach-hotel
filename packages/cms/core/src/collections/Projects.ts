/**
 * @file packages/cms/core/src/collections/Projects.ts
 * @version 4.0 - Multi-Tenant SaaS Core
 * @description Colección soberana para activos digitales.
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'tenantId', 'updatedAt'],
    group: 'Portafolio & Activos',
  },
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Asegura que el tenantId se asigne solo en creación
        if (operation === 'create' && req.user) {
          data.tenantId = req.user.tenantId;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Información General',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'slug', type: 'text', unique: true, required: true, index: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'imageUrl', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'liveUrl', type: 'text' },
                { name: 'codeUrl', type: 'text' },
              ]
            }
          ],
        },
        {
          label: 'Métrica de Protocolo 33',
          fields: [
            { 
              name: 'reputationWeight', 
              type: 'number', 
              defaultValue: 10,
              admin: { description: 'Peso de reputación que aporta este activo al Tenant.' }
            }
          ]
        }
      ]
    }
  ],
};