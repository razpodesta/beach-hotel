/**
 * @file packages/cms/core/src/collections/BlogPosts.ts
 * @description Colección soberana para el motor editorial (The Concierge Journal).
 *              Implementa estándares E-E-A-T y gobernanza multi-tenant.
 * @version 1.1 - Multi-Tenant & SEO Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
/**
 * @pilar V: Adherencia Arquitectónica.
 * Consumo de reglas de acceso centralizadas para mantener la coherencia del Monorepo.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate', 'tenantId'],
    group: 'Editorial Content',
    /**
     * @pilar III.X: Configuración Segura.
     * Resolución dinámica de la URL de previsualización basada en el entorno.
     */
    preview: (doc) => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';
      return `${baseUrl}/blog/${doc.slug}`;
    },
  },
  
  /**
   * @pilar VIII: Resiliencia en Seguridad.
   * Blindaje del contenido editorial bajo el paraguas multi-tenant.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Garantiza que el contenido editorial pertenezca al Tenant del creador
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
      type: 'tabs',
      tabs: [
        {
          label: 'Editorial',
          fields: [
            { name: 'title', type: 'text', required: true },
            { 
              name: 'slug', 
              type: 'text', 
              unique: true, 
              required: true, 
              index: true,
              admin: { description: 'Identificador único para la URL (ej: mi-primer-articulo)' }
            },
            { 
              name: 'content', 
              type: 'richText', 
              editor: lexicalEditor({}), 
              required: true 
            },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Atribución & Taxonomía',
          fields: [
            { 
              name: 'author', 
              type: 'relationship', 
              relationTo: 'users', 
              required: true,
              admin: { width: '50%' }
            },
            { 
              name: 'publishedDate', 
              type: 'date', 
              defaultValue: () => new Date().toISOString(),
              admin: { width: '50%' }
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
              name: 'tags',
              type: 'array',
              fields: [{ name: 'tag', type: 'text', required: true }]
            }
          ],
        },
        {
          label: 'SEO & Social',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            /**
             * @pilar I: Visión Holística.
             * Nota: Requiere que la colección 'media' esté habilitada en payload.config.ts.
             */
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        }
      ]
    }
  ],
};