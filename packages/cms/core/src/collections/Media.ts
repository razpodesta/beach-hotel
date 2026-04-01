/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Bóveda Soberana de Activos Multimedia (The Sanctuary Vault).
 *              Refactorizado: Aislamiento total Multi-Tenant, protección de 
 *              lectura por perímetro y sincronización de arquitectura S3.
 * @version 9.0 - Sovereign Tenant Isolation & Forensic Audit
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig, type CollectionBeforeChangeHook } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/**
 * @interface PayloadMediaDoc
 */
export interface PayloadMediaDoc {
  id: string;
  url?: string | null;
  alt: string;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  filename?: string | null;
  tenant?: string | Record<string, unknown> | null; 
  caption?: string | null;
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Infrastructure',
    description: 'Gestão centralizada de ativos visuais de alta fidelidade.',
    defaultColumns: ['alt', 'filename', 'mimeType', 'tenant'],
    preview: (doc) => doc?.url as string,
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * Blindaje contra el acceso cross-tenant de activos.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'hero-cinematic', width: 2560, height: 1080, position: 'centre' },
      { name: 'mobile-optimized', width: 1170, height: 2532, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/mp4'],
    focalPoint: true,
  },

  hooks: {
    beforeChange: [
      (({ req, data, operation }) => {
        // Garantía de herencia de tenant
        if (operation === 'create' && req.user) {
          const userTenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
          
          if (!data.tenant) data.tenant = userTenant;
        }
        return data;
      }) as CollectionBeforeChangeHook,
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`[HEIMDALL][VAULT] Handshake: ${doc.filename} | Tenant: ${doc.tenant}`);
        }
      }
    ]
  },

  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { 
        position: 'sidebar', 
        description: 'Perímetro soberano de propiedad del activo.' 
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      index: true,
      admin: { 
        description: 'Crítico para SEO E-E-A-T.',
        placeholder: 'Ej: Suíte Master vista mar'
      },
      validate: (val: string | null | undefined) => {
        if (val && val.length >= 8) return true;
        return 'El texto alternativo es obligatorio para SEO (mín. 8 caracteres).';
      }
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: { description: 'Información editorial para el Journal.' },
    },
  ],
};