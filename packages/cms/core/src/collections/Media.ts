/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Colección soberana para la gestión de activos multimedia (Media Library).
 *              Configurada para optimización de imágenes y gobernanza multi-tenant.
 * @version 1.0 - Asset Management Foundation
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantWriteAccess } from './Access';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Infrastructure',
    description: 'Repositorio central de imágenes para el Hotel, Festival y Journal.',
  },
  /**
   * @pilar VIII: Resiliencia en Seguridad.
   * Lectura pública para delivery en web; escritura restringida por Tenant.
   */
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },
  /**
   * @pilar X: Performance. 
   * Configuración de procesamiento de imágenes con tamaños optimizados.
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
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Texto descriptivo para SEO y accesibilidad.' },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: { description: 'Subtítulo o créditos de la imagen.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          data.tenantId = req.user.tenantId;
        }
        return data;
      },
    ],
  },
};