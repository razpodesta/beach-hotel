// RUTA: packages/cms/core/src/collections/Projects.ts

/**
 * @file Colección: Projects (Catálogo de Ingeniería de Élite)
 * @version 2.0 - CMS-Driven Architecture
 * @description Define la estructura completa de un proyecto. 
 *              Incluye branding dinámico y especificaciones técnicas profundas.
 * @author Raz Podestá - MetaShark Tech
 */

import { CollectionConfig } from 'payload';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
    group: 'Portfolio',
  },
  access: {
    read: () => true, // Público para el portafolio
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Información General',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'subtitle', type: 'text' },
            { name: 'description', type: 'textarea', required: true },
            { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'published' },
            { name: 'imageUrl', type: 'upload', relationTo: 'media', required: true },
          ],
        },
        {
          label: 'Arquitectura Técnica',
          fields: [
            { 
              name: 'tech_stack', 
              type: 'array', 
              fields: [{ name: 'tech', type: 'text' }] 
            },
            {
              name: 'backend_architecture',
              type: 'group',
              fields: [
                { name: 'title', type: 'text' },
                { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] }
              ]
            }
          ]
        },
        {
          label: 'Elite Options & Branding',
          fields: [
            {
              name: 'elite_options',
              type: 'array',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'detail', type: 'text' }
              ]
            },
            {
              name: 'branding',
              type: 'group',
              fields: [
                { name: 'primary_color', type: 'text', defaultValue: '#7c3aed' },
                { name: 'layout_style', type: 'select', options: ['minimal', 'immersive', 'editorial', 'corporate'] }
              ]
            }
          ]
        }
      ]
    }
  ],
};