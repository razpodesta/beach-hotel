/**
 * @file packages/cms/core/src/collections/BlogPosts.ts
 * @description Colección soberana para el motor editorial (The Concierge Journal).
 *              Refactorizado: Unificación relacional del campo 'tenant' para 
 *              integridad referencial y aislamiento Multi-Tenant.
 * @version 6.0 - Sovereign Tenant Sync & Relational Hardening
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

/**
 * IMPORTACIONES DE PERÍMETRO (Saneadas)
 * @pilar V: Adherencia arquitectónica.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  defaultSort: '-publishedDate',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate', 'tenant'],
    group: 'Editorial Sanctuary',
    description: 'Curaduría de artículos exclusivos para el Santuario Digital.',
  },
  
  /**
   * REGLAS DE ACCESO PERIMETRAL
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   */
  hooks: {
    beforeChange: [
      ({ req: _req, data, operation: _operation }) => {
        // 1. Garantía de Identidad Multi-Tenant y Atribución
        if (_operation === 'create' && _req.user) {
          /**
           * @fix: Sincronización con el nuevo esquema 'tenant'.
           * Aseguramos que el post pertenezca al perímetro del creador.
           */
          if (!data.tenant) data.tenant = _req.user.tenant;
          if (!data.author) data.author = _req.user.id;
        }
        
        // 2. Slugificación Automática
        if (data.title && typeof data.title === 'string' && !data.slug) {
           data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // 3. Normalización de Taxonomía
        if (data.tags && Array.isArray(data.tags)) {
          data.tags = data.tags.map((item: { tag: string }) => ({
            ...item,
            tag: item.tag.toLowerCase().trim()
          }));
        }

        // 4. Inteligencia Editorial: Cálculo de Tiempo de Lectura
        if (data.content && typeof data.content === 'object') {
            const contentString = JSON.stringify(data.content);
            const wordCount = contentString.split(/\s+/g).length;
            data.readingTime = Math.max(1, Math.ceil(wordCount / 200));
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation: _operation }) => {
        if (_operation === 'create' || _operation === 'update') {
          /** @pilar IV: Protocolo Heimdall - Telemetría Editorial */
          console.log(
            `[HEIMDALL][EDITORIAL] Sync: "${doc.title}" | Status: ${doc.status} | Tenant: ${doc.tenant}`
          );
        }
      }
    ]
  },

  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' }
    },
    {
      /**
       * @property tenant
       * @fix: Cambio de 'text' a 'relationship' para integridad referencial.
       * Renombrado para evitar la columna fantasma 'tenant_id_id'.
       */
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { 
        position: 'sidebar', 
        readOnly: true,
        description: 'Propriedade à qual este artigo pertence.'
      },
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
                  admin: { width: '60%', placeholder: 'Título de impacto' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  required: true, 
                  index: true, 
                  admin: { width: '40%', description: 'Ruta semántica para SEO' } 
                },
              ]
            },
            { 
              name: 'content', 
              type: 'richText', 
              required: true,
              admin: { description: 'Contenido enriquecido del artículo.' },
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
              admin: { description: 'Resumen para Meta-Description (SEO E-E-A-T).' }
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
                  admin: { 
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm'
                    }
                  }
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
                description: 'Minutos calculados automáticamente.' 
              } 
            },
            { 
              name: 'tags', 
              type: 'array', 
              fields: [{ name: 'tag', type: 'text', required: true }],
              admin: { description: 'Categorización para el motor de búsqueda.' }
            }
          ],
        },
        {
          label: 'SEO & Social',
          fields: [
            { name: 'metaTitle', type: 'text', admin: { description: 'Título alternativo para buscadores.' } },
            { 
              name: 'ogImage', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
              admin: { description: 'Imagen de alta fidelidad para redes sociales.' }
            },
          ],
        }
      ]
    }
  ],
};