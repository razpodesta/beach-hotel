/**
 * @file Projects.ts
 * @description Colección soberana para la gestión de activos digitales de ingeniería.
 *              Refactorizado: Nivelación UUID (ID tipo Texto), validación de color hex
 *              y normalización de datos resiliente para el Genesis Engine.
 * @version 7.0 - UUID Standard & Color Validation
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

/**
 * @type ProjectLayoutStyleType
 * @description Exportación de contrato para el Shaper de datos y el Seeder.
 */
export type ProjectLayoutStyleType = 'minimal' | 'immersive' | 'editorial' | 'corporate' | 'brutalist';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'reputationWeight', 'tenantId'],
    group: 'Hospitality Assets',
    description: 'Catálogo de infraestructuras digitales y proyectos de alto rendimiento.',
  },
  
  /**
   * REGLAS DE ACCESO
   * @pilar III: Seguridad de Tipos.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   * @pilar VIII: Resiliencia - Normalización polimórfica de datos.
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // 1. Garantía Multi-Tenant
        if (operation === 'create' && req.user?.tenantId) {
          if (!data.tenantId) data.tenantId = req.user.tenantId;
        }

        // 2. Slugificación Automática Sanitizada
        if (typeof data.title === 'string' && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // 3. Normalización de Arrays (Tags y Tech Stack)
        // Permite que el Seeder envíe strings simples y el CMS los convierta a objetos.
        if (Array.isArray(data.tags) && typeof data.tags[0] === 'string') {
          data.tags = data.tags.map((tag: string) => ({ tag }));
        }

        if (Array.isArray(data.tech_stack) && typeof data.tech_stack[0] === 'string') {
          data.tech_stack = data.tech_stack.map((technology: string) => ({ technology }));
        }

        // 4. Normalización de Arquitectura Backend
        if (data.backend_architecture && 
            Array.isArray(data.backend_architecture.features) && 
            typeof data.backend_architecture.features[0] === 'string') {
          data.backend_architecture.features = data.backend_architecture.features.map((feature: string) => ({ feature }));
        }

        return data;
      },
    ],
  },

  fields: [
    /* 
       PILAR I: VISIÓN HOLÍSTICA
       Forzamos el ID como texto para permitir UUIDs y evitar la colisión 
       de tipos con tablas de relaciones internas de Payload.
    */
    {
      name: 'id',
      type: 'text',
    },
    { 
      name: 'tenantId', 
      type: 'text', 
      index: true, 
      admin: { position: 'sidebar', readOnly: true } 
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
            { name: 'imageUrl', type: 'text', required: true, admin: { description: 'URL del activo visual principal.' } },
            { type: 'row', fields: [
                { name: 'liveUrl', type: 'text', admin: { placeholder: 'https://...' } },
                { name: 'codeUrl', type: 'text', admin: { placeholder: 'GitHub URL' } },
            ]},
            { 
              name: 'tags', 
              type: 'array', 
              required: true, 
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Etiquetas de categorización para el Frontend.' }
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
                  // @pilar III: Seguridad de Datos. Regex para validar formato Hex.
                  validate: (val: string | null | undefined) => {
                    return val && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val) 
                      ? true 
                      : 'Debe ser un código hexadecimal válido (ej: #FF0000)';
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
          label: 'Protocolo 33',
          fields: [
            { 
              name: 'reputationWeight', 
              type: 'number', 
              defaultValue: 10, 
              min: 0, 
              required: true,
              admin: { description: 'Valor de recompensa en XP (RazTokens).' }
            }
          ]
        }
      ]
    }
  ],
};