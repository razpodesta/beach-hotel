/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Colección soberana para la gestión de activos multimedia (Sovereign Media Library).
 *              Implementa orquestación multitenant, optimización automática de imágenes
 *              y blindaje de accesibilidad (A11Y). Sincronizado con UUIDs de Supabase.
 * @version 4.0 - Vercel Build Normalization & Forensic Logging
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';

/**
 * IMPORTACIONES DE PERÍMETRO (Saneadas)
 * @pilar V: Adherencia arquitectónica. Eliminación de extensión .js para 
 * garantizar resolución nativa en Next.js 15 y el pipeline de Vercel.
 */
import { multiTenantWriteAccess } from './Access';

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
   * Lectura pública para el frontend; gestión (CUD) restringida por Tenant ID.
   */
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * CONFIGURACIÓN DE CARGA (Upload Engine)
   * @pilar X: Performance - Generación de derivados optimizados para Core Web Vitals.
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
    mimeTypes: ['image/*'], // Restricción estricta a imágenes para asegurar pureza de la galería.
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   * @pilar IV: Observabilidad - Trazabilidad de activos mediante Protocolo Heimdall.
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
          console.log(
            `[HEIMDALL][MEDIA] Asset Ingested: ${doc.filename} | Mime: ${doc.mimeType} | Tenant: ${doc.tenantId}`
          );
        }
      }
    ]
  },

  fields: [
    /**
     * @pilar I: Visión Holística - Soberanía UUID.
     * Forzamos el ID como texto para permitir identificadores deterministas
     * y evitar colisiones de tipos relacionales en Supabase.
     */
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
      /**
       * @pilar III: Seguridad de Tipos.
       * Validación de longitud mínima para asegurar calidad de metadatos.
       */
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