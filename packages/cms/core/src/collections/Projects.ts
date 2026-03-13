/**
 * @file packages/cms/core/src/collections/Projects.ts
 * @description Colección soberana para la gestión de activos digitales y proyectos.
 *              Implementa gobernanza multi-tenant y maquetación de élite.
 * @version 4.2 - Type Contract Fixed (P3.0 Stable)
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
/**
 * @pilar V: Adherencia Arquitectónica.
 * Resolución de módulos sin extensión para compatibilidad con el Bundler.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'tenantId', 'updatedAt'],
    group: 'Hospitality Assets',
    description: 'Gestión centralizada de activos inmobiliarios y experiencias del hotel.',
  },
  
  /**
   * @pilar VIII: Resiliencia en Seguridad.
   * Capa de acceso blindada para arquitectura SaaS Multi-Tenant.
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
        // Garantiza la integridad del TenantId en la creación
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
      admin: { 
        position: 'sidebar', 
        readOnly: true,
        description: 'ID de propiedad digital asignado automáticamente.'
      },
    },
    {
      name: 'status',
      type: 'select',
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
          label: 'Información del Activo',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true,
                  /**
                   * CORRECCIÓN TS2353: 
                   * 'flexGrow' eliminado. Se usa 'width' dentro de 'admin' 
                   * para controlar la maquetación en el panel.
                   */
                  admin: { width: '70%' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  required: true, 
                  index: true,
                  admin: { width: '30%' }
                },
              ]
            },
            { name: 'description', type: 'textarea', required: true },
            { 
              name: 'imageUrl', 
              type: 'text', 
              required: true,
              admin: { 
                description: 'URL del recurso visual (Recomendado: 1200x630px).' 
              }
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'liveUrl', 
                  type: 'text', 
                  admin: { width: '50%', placeholder: 'https://hotel-beach.com' } 
                },
                { 
                  name: 'codeUrl', 
                  type: 'text', 
                  admin: { width: '50%', placeholder: 'https://github.com/...' } 
                },
              ]
            }
          ],
        },
        {
          label: 'Protocolo 33',
          fields: [
            { 
              name: 'reputationWeight', 
              type: 'number', 
              defaultValue: 10,
              admin: { 
                description: 'Peso algorítmico del activo para el sistema de gamificación.' 
              }
            }
          ]
        }
      ]
    }
  ],
};