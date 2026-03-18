/**
 * @file Projects.ts
 * @description Colección soberana para la gestión de Activos Digitales y Experiencias.
 *              Orquesta la ingeniería, estética y valor de reputación (Protocolo 33)
 *              de cada proyecto en el ecosistema MetaShark.
 * @version 6.0 - Protocol 33 Immortality & Media Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'reputationWeight', 'tenantId'],
    group: 'Hospitality Assets',
    description: 'Bóveda de activos digitales de alto rendimiento y experiencias de marca.',
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar III: Seguridad de Tipos Absoluta.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   * @pilar VIII: Resiliencia - Automatización y Normalización JIT.
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // 1. Blindaje Multi-Tenant
        if (operation === 'create' && req.user?.tenantId) {
          data.tenantId = req.user.tenantId;
        }

        // 2. Slugificación Soberana
        if (typeof data.title === 'string' && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        /**
         * 3. NORMALIZACIÓN DE ARRAYS (Mirror Sync)
         * @description Traduce arrays planos del Seeder/Mocks al formato tabular de Payload.
         */
        if (Array.isArray(data.tags) && typeof data.tags[0] === 'string') {
          data.tags = data.tags.map((tag: string) => ({ tag }));
        }

        if (Array.isArray(data.tech_stack) && typeof data.tech_stack[0] === 'string') {
          data.tech_stack = data.tech_stack.map((tech: string) => ({ technology: tech }));
        }

        if (
          data.backend_architecture?.features && 
          Array.isArray(data.backend_architecture.features) && 
          typeof data.backend_architecture.features[0] === 'string'
        ) {
          data.backend_architecture.features = data.backend_architecture.features.map(
            (feat: string) => ({ feature: feat })
          );
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`[HEIMDALL][ASSET] New Asset Minted: ${doc.title} | Value: ${doc.reputationWeight} RZB`);
        }
      }
    ]
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
      index: true,
      options: [
        { label: 'Borrador', value: 'draft' },
        { label: 'Publicado', value: 'published' }
      ],
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad del Activo',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                { name: 'slug', type: 'text', unique: true, index: true, admin: { width: '30%' } },
              ]
            },
            { name: 'description', type: 'textarea', required: true },
            { 
              name: 'imageUrl', 
              type: 'text', 
              required: true,
              admin: { description: 'URL del activo visual. Se recomienda ruta absoluta de la Media Library.' }
            },
            {
              type: 'row',
              fields: [
                { name: 'liveUrl', type: 'text', admin: { width: '50%', placeholder: 'https://demo.com' } },
                { name: 'codeUrl', type: 'text', admin: { width: '50%', placeholder: 'https://github.com/...' } },
              ]
            },
            {
              name: 'tags',
              type: 'array',
              required: true,
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Etiquetas de categorización para filtrado en la UI.' }
            }
          ],
        },
        {
          label: 'Ingeniería de Élite',
          fields: [
            {
              name: 'introduction',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true }
              ]
            },
            {
              name: 'tech_stack',
              type: 'array',
              required: true,
              fields: [{ name: 'technology', type: 'text', required: true }],
              admin: { description: 'Stack tecnológico verificado.' }
            },
            {
              name: 'backend_architecture',
              type: 'group',
              admin: { description: 'Detalles estructurales del cerebro digital.' },
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
            },
            {
              name: 'elite_options',
              type: 'array',
              admin: { description: 'Opciones de despliegue avanzadas (Edge, Sovereign, etc).' },
              fields: [
                { name: 'name', type: 'text', required: true, admin: { width: '40%' } },
                { name: 'detail', type: 'textarea', required: true, admin: { width: '60%' } }
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
              fields: [
                {
                  name: 'primary_color',
                  type: 'text',
                  required: true,
                  admin: { description: 'Acento cromático HEX (ej: #a855f7)' },
                  validate: (val: string | null | undefined) => {
                    if (!val) return 'Color obligatorio';
                    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val) || 'Formato HEX inválido';
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
                    { label: 'Brutalista', value: 'brutalist' }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33 (Gamificación)',
          fields: [
            { 
              name: 'reputationWeight', 
              type: 'number', 
              defaultValue: 10,
              min: 0,
              required: true,
              admin: { 
                description: 'Peso algorítmico (RZB) que otorga este activo al poseedor.' 
              }
            }
          ]
        }
      ]
    }
  ],
};