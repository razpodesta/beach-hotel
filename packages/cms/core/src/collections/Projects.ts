/**
 * @file packages/cms/core/src/collections/Projects.ts
 * @description Colección soberana para la gestión de activos digitales de ingeniería.
 *              Refactorizado: Erradicación del campo 'id' manual para cumplimiento 
 *              de UUID nativo de Payload 3.0, unificación relacional y 
 *              blindaje de integridad Multi-Tenant.
 * @version 10.1 - Payload Native ID Compliance
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/**
 * @type ProjectLayoutStyleType
 */
export type ProjectLayoutStyleType = 'minimal' | 'immersive' | 'editorial' | 'corporate' | 'brutalist';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'reputationWeight', 'tenant'],
    group: 'Hospitality Assets',
    description: 'Catálogo de infraestructuras digitales y activos de alta ingeniería.',
  },
  
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    beforeChange: [
      ({ req: _req, data, operation: _operation }) => {
        // 1. Garantía de Identidad Multi-Tenant (Relacional)
        if (_operation === 'create' && _req.user) {
          if (!data.tenant) {
            data.tenant = typeof _req.user.tenant === 'object' && _req.user.tenant !== null 
              ? _req.user.tenant.id 
              : _req.user.tenant;
          }
        }

        // 2. Slugificación Automática Sanitizada
        if (data.title && typeof data.title === 'string' && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // 3. Normalización "Mirror Sync"
        if (Array.isArray(data.tags) && typeof data.tags[0] === 'string') {
          data.tags = data.tags.map((tag: string) => ({ tag }));
        }

        if (Array.isArray(data.tech_stack) && typeof data.tech_stack[0] === 'string') {
          data.tech_stack = data.tech_stack.map((technology: string) => ({ technology }));
        }

        if (data.backend_architecture?.features && Array.isArray(data.backend_architecture.features)) {
          if (typeof data.backend_architecture.features[0] === 'string') {
            data.backend_architecture.features = data.backend_architecture.features.map((feature: string) => ({ feature }));
          }
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation: _operation }) => {
        if (_operation === 'create') {
          console.log(`[HEIMDALL][INFRASTRUCTURE] Digital Asset Ingested: ${doc.title} (Weight: ${doc.reputationWeight} RZB)`);
        }
      }
    ]
  },

  fields: [
    { 
      name: 'tenant', 
      type: 'relationship', 
      relationTo: 'tenants',
      required: true,
      index: true, 
      admin: { 
        position: 'sidebar', 
        readOnly: true,
        description: 'Propriedade proprietária deste ativo.'
      } 
    },
    { 
      name: 'status', 
      type: 'select', 
      index: true, 
      options: [
        { label: 'Borrador', value: 'draft' }, 
        { label: 'Publicado', value: 'published' }
      ], 
      defaultValue: 'draft', 
      admin: { position: 'sidebar' } 
    },
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
            { name: 'imageUrl', type: 'text', required: true, admin: { description: 'URL canónica del activo visual.' } },
            { type: 'row', fields: [
                { name: 'liveUrl', type: 'text', admin: { placeholder: 'https://...' } },
                { name: 'codeUrl', type: 'text', admin: { placeholder: 'GitHub Repository' } },
            ]},
            { 
              name: 'tags', 
              type: 'array', 
              required: true, 
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Taxonomía de clasificación para el frontend.' }
            }
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
                { 
                  name: 'features', 
                  type: 'array', 
                  required: true, 
                  fields: [{ name: 'feature', type: 'text', required: true }] 
                }
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
                { 
                  name: 'primary_color', 
                  type: 'text', 
                  required: true,
                  validate: (val: string | null | undefined) => {
                    return val && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val) 
                      ? true 
                      : 'Debe ser un código hexadecimal válido (ej: #A855F7)';
                  }
                },
                { 
                  name: 'layout_style', 
                  type: 'select', 
                  required: true, 
                  defaultValue: 'minimal',
                  options: [
                    { label: 'Minimalista', value: 'minimal' },
                    { label: 'Inmersivo', value: 'immersive' },
                    { label: 'Editorial', value: 'editorial' },
                    { label: 'Corporativo', value: 'corporate' },
                    { label: 'Brutalista', value: 'brutalista' }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33',
          fields: [
            { 
              name: 'reputationWeight', 
              type: 'number', 
              defaultValue: 10, 
              min: 0, 
              required: true,
              admin: { description: 'Peso de reputación en RazTokens (XP).' }
            }
          ]
        }
      ]
    }
  ],
};