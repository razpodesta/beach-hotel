// RUTA: packages/cms/core/src/collections/BlogPosts.ts

/**
 * @file Colección: BlogPosts (Autoridad E-E-A-T)
 * @version 1.0 - Editorial Engine
 * @description Gestión de artículos para el CMS. Incluye editor de texto rico,
 *              SEO dinámico, campos de autoría y taxonomía.
 * @author Raz Podestá - MetaShark Tech
 */

import { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate'],
    group: 'Contenido',
    preview: (doc) => `https://tu-sitio.com/blog/${doc.slug}`,
  },
  access: {
    read: ({ req }) => {
      // Público si está publicado, Admin siempre ve todo
      if (req.user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenido',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'slug', type: 'text', required: true, index: true },
            { 
              name: 'content', 
              type: 'richText', 
              editor: lexicalEditor(), 
              required: true 
            },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
        {
          label: 'Metadatos & Autoría',
          fields: [
            { 
              name: 'author', 
              type: 'relationship', 
              relationTo: 'users', 
              required: true 
            },
            { name: 'publishedDate', type: 'date', defaultValue: () => new Date().toISOString() },
            { 
              name: 'status', 
              type: 'select', 
              options: ['draft', 'published'], 
              defaultValue: 'draft',
              admin: { position: 'sidebar' }
            },
            {
              name: 'tags',
              type: 'array',
              fields: [{ name: 'tag', type: 'text' }]
            }
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        }
      ]
    }
  ],
};