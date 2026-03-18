/**
 * @file Media.ts
 * @description Colección soberana para la gestión de activos multimedia (Sovereign Media Library).
 *              Implementa orquestación multitenant, optimización automática de imágenes
 *              y blindaje de accesibilidad (A11Y).
 * @version 2.0 - Performance & A11Y Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
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
   * Lectura pública para el frontend; gestión restringida por Tenant ID.
   */
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * CONFIGURACIÓN DE CARGA (Upload Engine)
   * @pilar X: Performance - Generación de derivados optimizados.
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
    mimeTypes: ['image/*'], // Restricción estricta a imágenes para esta colección
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   * @pilar IV: Observabilidad - Trazabilidad de activos.
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Garantía de Identidad Multi-Tenant
        if (operation === 'create' && req.user) {
          data.tenantId = req.user.tenantId;
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`[HEIMDALL][MEDIA] Asset Ingested: ${doc.filename} | Alt: ${doc.alt}`);
        }
      }
    ]
  },

  fields: [
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
      // @pilar III: Seguridad de Tipos. Validación de longitud para SEO.
      validate: (val: string | null | undefined) => {
        if (val && val.length > 5) return true;
        return 'El texto alternativo debe ser más descriptivo (mín. 6 caracteres).';
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