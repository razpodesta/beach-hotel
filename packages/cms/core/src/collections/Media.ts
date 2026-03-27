/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Colección soberana para la gestión de activos multimedia (Sovereign Media Library).
 *              Implementa orquestación multitenant, optimización automática de imágenes
 *              y blindaje de accesibilidad (A11Y). Sincronizado con UUIDs de Supabase.
 * @version 4.2 - ESM Resolution & Hook Hygiene
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';

/**
 * IMPORTACIONES DE PERÍMETRO (Saneadas)
 * @fix Resolución TS2835: Extensión .js obligatoria para resolución en ESM/nodenext.
 */
import { multiTenantWriteAccess } from './Access.js';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Infrastructure',
    description: 'Bóveda central de activos visuales para el Hotel, Festival y Journal.',
    defaultColumns: ['alt', 'filename', 'mimeType', 'tenantId'],
  },
  
  /**
   * REGLAS DE ACCESO
   * @pilar VIII: Resiliencia en Seguridad.
   */
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * CONFIGURACIÓN DE CARGA (Upload Engine)
   */
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   */
  hooks: {
    beforeChange: [
      ({ req: _req, data, operation: _operation }) => {
        // Corrección TS6133: Parámetros ignorados con guion bajo
        if (_operation === 'create' && _req.user) {
          data.tenantId = _req.user.tenantId;
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation: _operation }) => {
        // Corrección TS6133: Parámetro ignorado con guion bajo
        if (_operation === 'create') {
          console.log(
            `[HEIMDALL][MEDIA] Asset Ingested: ${doc.filename} | Mime: ${doc.mimeType} | Tenant: ${doc.tenantId}`
          );
        }
      }
    ]
  },

  fields: [
    {
      name: 'id',
      type: 'text',
    },
    {
      name: 'tenantId',
      type: 'text',
      index: true,
      admin: { 
        position: 'sidebar', 
        readOnly: true,
        description: 'Propiedad digital vinculada al activo.'
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      index: true,
      admin: { 
        description: 'Crítico para SEO y lectores de pantalla. Describe la imagen con precisión.',
        placeholder: 'Ej: Vista panorámica de la suite master al amanecer'
      },
      validate: (val: string | null | undefined) => {
        if (val && val.length >= 6) return true;
        return 'El texto alternativo debe ser descriptivo (mín. 6 caracteres).';
      }
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: { 
        description: 'Texto opcional que aparecerá debajo de la imagen en contextos editoriales.' 
      },
    },
  ],
};