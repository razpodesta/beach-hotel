/**
 * @file packages/cms/core/src/collections/BlogPosts.ts
 * @description Colección soberana para el motor editorial (The Concierge Journal).
 *              Implementa gobernanza multi-tenant, automatización de slugs y métricas E-E-A-T.
 * @version 1.3 - Lexical Contract & Prop Placement Fixed
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { 
  lexicalEditor, 
  HTMLConverterFeature, 
  FixedToolbarFeature, 
  HeadingFeature, 
  LinkFeature 
} from '@payloadcms/richtext-lexical';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  /**
   * @pilar XII: MEA/UX. 
   * CORRECCIÓN TS2353: 'defaultSort' reside en la raíz de la colección.
   */
  defaultSort: '-publishedDate',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate', 'tenantId'],
    group: 'Editorial Sanctuary',
    preview: (doc) => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';
      return `${baseUrl}/blog/${doc.slug}`;
    },
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
        // 1. Garantía de Identidad Multi-Tenant
        if (operation === 'create' && req.user) {
          data.tenantId = req.user.tenantId;
        }
        
        // 2. @pilar XII: Automatización de Slug
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
        }

        // 3. Simulación de cálculo de tiempo de lectura (Lógica de próxima generación)
        if (data.content) {
          data.readingTime = 5; // Placeholder para lógica de conteo de palabras
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
      type: 'tabs',
      tabs: [
        {
          label: 'Narrativa Editorial',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', type: 'text', required: true, admin: { width: '60%' } },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  required: true, 
                  admin: { 
                    width: '40%',
                    description: 'Generado automáticamente a partir del título.' 
                  } 
                },
              ]
            },
            { 
              name: 'content', 
              type: 'richText', 
              required: true,
              /**
               * @pilar X: Performance y Control.
               * CORRECCIÓN TS2724: Uso de PascalCase para Features de Lexical.
               */
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  LinkFeature({}),
                  HTMLConverterFeature({}),
                ],
              }), 
            },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Atribución y Métricas',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'author', 
                  type: 'relationship', 
                  relationTo: 'users', 
                  required: true,
                  admin: { width: '50%' },
                  filterOptions: ({ req }) => {
                    if (!req.user?.tenantId) return true;
                    return {
                      tenantId: { equals: req.user.tenantId }
                    };
                  }
                },
                { 
                  name: 'publishedDate', 
                  type: 'date', 
                  defaultValue: () => new Date().toISOString(),
                  admin: { width: '50%' }
                },
              ]
            },
            { 
              name: 'status', 
              type: 'select', 
              options: [
                { label: 'Borrador', value: 'draft' },
                { label: 'Publicado', value: 'published' }
              ], 
              defaultValue: 'draft',
              admin: { position: 'sidebar' }
            },
            {
              name: 'readingTime',
              type: 'number',
              admin: {
                position: 'sidebar',
                readOnly: true,
              }
            },
            {
              name: 'tags',
              type: 'array',
              fields: [{ name: 'tag', type: 'text', required: true }]
            }
          ],
        },
        {
          label: 'SEO (E-E-A-T)',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            { 
              name: 'ogImage', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
            },
          ],
        }
      ]
    }
  ],
};