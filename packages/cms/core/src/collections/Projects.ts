/**
 * @file Projects.ts
 * @description Colección soberana para activos digitales.
 * @version 6.1 - Validada para Genesis Engine
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

// Exportación para uso externo en seeder (evita 'any')
export type ProjectLayoutStyleType = 'minimal' | 'immersive' | 'editorial' | 'corporate' | 'brutalist';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'reputationWeight', 'tenantId'],
    group: 'Hospitality Assets',
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
        if (operation === 'create' && req.user?.tenantId) {
          data.tenantId = req.user.tenantId;
        }

        if (typeof data.title === 'string' && !data.slug) {
          data.slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        }

        // Normalización Estricta (Mirror Sync)
        if (Array.isArray(data.tags) && typeof data.tags[0] === 'string') {
          data.tags = data.tags.map((tag: string) => ({ tag }));
        }

        if (Array.isArray(data.tech_stack) && typeof data.tech_stack[0] === 'string') {
          data.tech_stack = data.tech_stack.map((technology: string) => ({ technology }));
        }

        // Normalización profunda de estructura anidada (Evita el 400 Bad Request)
        if (data.backend_architecture && Array.isArray(data.backend_architecture.features) && typeof data.backend_architecture.features[0] === 'string') {
          data.backend_architecture.features = data.backend_architecture.features.map((feature: string) => ({ feature }));
        }

        return data;
      },
    ],
  },

  fields: [
    { name: 'tenantId', type: 'text', index: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'status', type: 'select', index: true, options: [{ label: 'Borrador', value: 'draft' }, { label: 'Publicado', value: 'published' }], defaultValue: 'draft', admin: { position: 'sidebar' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad del Activo',
          fields: [
            { type: 'row', fields: [
                { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                { name: 'slug', type: 'text', unique: true, index: true, admin: { width: '30%' } },
            ]},
            { name: 'description', type: 'textarea', required: true },
            { name: 'imageUrl', type: 'text', required: true },
            { type: 'row', fields: [
                { name: 'liveUrl', type: 'text' },
                { name: 'codeUrl', type: 'text' },
            ]},
            { name: 'tags', type: 'array', required: true, fields: [{ name: 'tag', type: 'text', required: true }] }
          ],
        },
        {
          label: 'Ingeniería de Élite',
          fields: [
            {
              name: 'introduction',
              type: 'group',
              required: true,
              fields: [
                { name: 'heading', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true }
              ]
            },
            {
              name: 'tech_stack',
              type: 'array',
              required: true,
              fields: [{ name: 'technology', type: 'text', required: true }]
            },
            {
              name: 'backend_architecture',
              type: 'group',
              required: true,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { name: 'features', type: 'array', required: true, fields: [{ name: 'feature', type: 'text', required: true }] }
              ]
            }
          ]
        },
        {
          label: 'Estética & Branding',
          fields: [
            {
              name: 'branding',
              type: 'group',
              required: true,
              fields: [
                { name: 'primary_color', type: 'text', required: true },
                { name: 'layout_style', type: 'select', required: true, defaultValue: 'minimal',
                  options: [
                    { label: 'Minimalista', value: 'minimal' },
                    { label: 'Inmersivo', value: 'immersive' },
                    { label: 'Editorial', value: 'editorial' },
                    { label: 'Corporativo', value: 'corporate' },
                    { label: 'Brutalista', value: 'brutalist' }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33',
          fields: [
            { name: 'reputationWeight', type: 'number', defaultValue: 10, min: 0, required: true }
          ]
        }
      ]
    }
  ],
};