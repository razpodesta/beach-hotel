/**
 * @file Media.ts
 * @description Colección soberana para la gestión de activos multimedia.
 *              Refactorizado: Soporte para UUIDs (ID tipo Texto) para garantizar
 *              consistencia relacional con el Hub Editorial y el Journal.
 * @version 3.0 - UUID Standard & Performance Hardening
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
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
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
    /* 
       PILAR I: VISIÓN HOLÍSTICA
       Forzamos el ID como texto para permitir el uso de UUIDs deterministas
       y evitar colisiones de tipos en tablas de relaciones (_rels).
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
        description: 'Crítico para SEO y lectores de pantalla.',
        placeholder: 'Ej: Vista panorámica de la suite master al amanecer'
      },
      validate: (val: string | null | undefined) => {
        if (val && val.length > 5) return true;
        return 'El texto alternativo debe ser más descriptivo (mín. 6 caracteres).';
      }
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: { 
        description: 'Texto opcional editorial.' 
      },
    },
  ],
};