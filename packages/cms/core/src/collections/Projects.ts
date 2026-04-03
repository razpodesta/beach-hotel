/**
 * @file packages/cms/core/src/collections/Projects.ts
 * @description Colección soberana para la gestión de activos digitales de ingeniería.
 *              Refactorizado: Erradicación total de 'any' mediante interfaces,
 *              tipado estricto y cumplimiento de linter.
 * @version 10.3 - Type Safe & Linter Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

// --- CONTRATOS DE ESTRUCTURA PARA HOOKS ---
interface TagItem { tag: string }
interface TechItem { technology: string }
interface FeatureItem { feature: string }

export type ProjectLayoutStyleType = 'minimal' | 'immersive' | 'editorial' | 'corporate' | 'brutalista';

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
        // 1. Inyección de Identidad Multi-Tenant
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

        // 3. Normalización "Mirror Sync" (Saneamiento Forense)
        if (data.tags && Array.isArray(data.tags)) {
          data.tags = (data.tags as unknown[]).map((item): TagItem => 
            typeof item === 'string' ? { tag: item.toLowerCase().trim() } : (item as TagItem)
          );
        }

        if (data.tech_stack && Array.isArray(data.tech_stack)) {
          data.tech_stack = (data.tech_stack as unknown[]).map((item): TechItem => 
            typeof item === 'string' ? { technology: item } : (item as TechItem)
          );
        }

        if (data.backend_architecture?.features && Array.isArray(data.backend_architecture.features)) {
          data.backend_architecture.features = (data.backend_architecture.features as unknown[]).map((item): FeatureItem => 
            typeof item === 'string' ? { feature: item } : (item as FeatureItem)
          );
        }

        return data;
      },
    ],
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
                { name: 'primary_color', type: 'text', required: true },
                { name: 'layout_style', type: 'select', required: true, options: ['minimal', 'immersive', 'editorial', 'corporate', 'brutalista'] }
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33',
          fields: [
            { name: 'reputationWeight', type: 'number', defaultValue: 10, required: true }
          ]
        }
      ]
    }
  ],
};