/**
 * @file packages/cms/core/src/collections/BlogPosts.ts
 * @description Colección soberana para el motor editorial (The Concierge Journal).
 *              Implementa orquestación multitenant, cálculo automatizado de métricas
 *              de lectura y blindaje de autoridad SEO E-E-A-T.
 * @version 4.0 - Resolution Sync & Reading Metrics Hardening
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
 * @pilar V: Adherencia arquitectónica. Eliminación de extensión .js para 
 * garantizar resolución nativa en Next.js 15 y el pipeline de Vercel.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

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
   * REGLAS DE ACCESO PERIMETRAL
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
   * @pilar VIII: Resiliencia - Automatización de metadatos y saneamiento.
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // 1. Garantía de Identidad Multi-Tenant y Atribución
        if (operation === 'create' && req.user) {
          if (!data.tenantId) data.tenantId = req.user.tenantId;
          if (!data.author) data.author = req.user.id;
        }
        
        // 2. Slugificación Automática (Fail-Safe)
        if (data.title && typeof data.title === 'string' && !data.slug) {
           data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Sanatización de caracteres
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
        // @pilar X: Performance - Estimación asíncrona basada en volumen Lexical.
        if (data.content && typeof data.content === 'object') {
            const contentString = JSON.stringify(data.content);
            const wordCount = contentString.split(/\s+/g).length;
            // Estándar de la industria: 200 PPM
            data.readingTime = Math.max(1, Math.ceil(wordCount / 200));
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(
            `[HEIMDALL][EDITORIAL] Sync: "${doc.title}" | Status: ${doc.status} | ETA: ${doc.readingTime} min.`
          );
        }
      }
    ]
  },

  fields: [
    /**
     * @pilar I: Visión Holística - Soberanía UUID.
     * Mantenemos el ID como texto para compatibilidad absoluta con Supabase.
     */
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' }
    },
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