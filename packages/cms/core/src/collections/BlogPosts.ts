/**
 * @file BlogPosts.ts
 * @description Colección soberana para el motor editorial (The Concierge Journal).
 *              Implementa orquestación multi-tenant, cálculo automatizado de métricas
 *              y blindaje de autoridad E-E-A-T.
 * @version 2.0 - Metric Automation & Author Resilience
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
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  defaultSort: '-publishedDate',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate', 'tenantId'],
    group: 'Editorial Sanctuary',
    description: 'Curaduría de artículos exclusivos para el Santuario Digital.',
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
   * @pilar VIII: Resiliencia - Automatización de metadatos.
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // 1. Garantía de Multi-Tenancy
        if (operation === 'create' && req.user) {
          data.tenantId = req.user.tenantId;
          // Auto-asignación de autor si no se proporciona
          if (!data.author) data.author = req.user.id;
        }
        
        // 2. Slugificación Dinámica Sanitizada
        if (data.title && typeof data.title === 'string' && !data.slug) {
           data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // 3. Cálculo de Tiempo de Lectura (Pilar X: Performance)
        if (data.content && typeof data.content === 'object') {
            // Estimación basada en el volumen del AST de Lexical
            const contentString = JSON.stringify(data.content);
            const wordCount = contentString.split(/\s+/g).length;
            // Estándar: 200 palabras por minuto
            data.readingTime = Math.max(1, Math.ceil(wordCount / 200));
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
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '60%', placeholder: 'Título del artículo' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  required: true, 
                  index: true, 
                  admin: { width: '40%', description: 'Identificador único de URL' } 
                },
              ]
            },
            { 
              name: 'content', 
              type: 'richText', 
              required: true,
              admin: { description: 'Contenido principal enriquecido.' },
              editor: lexicalEditor({
                features: () => [
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  LinkFeature({}),
                  HTMLConverterFeature({}),
                ],
              }), 
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: { description: 'Resumen corto para la tarjeta del blog (SEO Meta Description).' }
            },
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
                  index: true,
                  admin: { width: '50%' }
                },
                { 
                  name: 'publishedDate', 
                  type: 'date', 
                  index: true, 
                  required: true,
                  admin: { width: '50%' }
                },
              ]
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
              name: 'readingTime', 
              type: 'number', 
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                description: 'Cálculo automático en minutos.' 
              } 
            },
            { 
              name: 'tags', 
              type: 'array', 
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Taxonomía para filtrado en la UI.' }
            }
          ],
        },
        {
          label: 'SEO & Social',
          fields: [
            { name: 'metaTitle', type: 'text', admin: { description: 'Opcional: Título para buscadores.' } },
            { 
              name: 'ogImage', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
              admin: { description: 'Imagen de portada y miniatura compartida (E-E-A-T).' }
            },
          ],
        }
      ]
    }
  ],
};