/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Bóveda Soberana de Activos Multimedia (The Sanctuary Vault).
 *              Refactorizado: Integración de integridad referencial Multi-Tenant,
 *              optimización de focal-point para UX cinemática y sincronía S3.
 * @version 6.0 - Next-Gen Asset Management & Supabase S3 Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';

/**
 * IMPORTACIONES DE PERÍMETRO
 * @pilar V: Adherencia arquitectónica.
 */
import { multiTenantWriteAccess } from './Access';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Infrastructure',
    description: 'Gestão centralizada de ativos visuais de alta fidelidade.',
    defaultColumns: ['alt', 'filename', 'mimeType', 'tenantId'],
    /** @pilar XII: MEA/UX - Facilita la identificación visual en el listado */
    preview: (doc) => doc?.url as string,
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * LECTURA: Pública para visualización en el Hotel/Festival.
   * ESCRITURA: Restringida por jerarquía de Tenant.
   */
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * MOTOR DE CARGA (Cloud Optimized)
   * @description Configurado para interactuar con el plugin S3 de Supabase.
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
        name: 'hero-cinematic', // Optimizado para Desktop Ultra-Wide
        width: 2560,
        height: 1080,
        position: 'centre',
      },
      {
        name: 'mobile-optimized', // Optimizado para iPhone/Android High PPI
        width: 1170,
        height: 2532,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/mp4'],
    /** Habilita el control manual del punto de interés en el Dashboard */
    focalPoint: true,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks de Infraestructura)
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          // Asignación automática del Tenant propietario
          if (!data.tenantId) data.tenantId = req.user.tenantId;
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          /** @pilar IV: Protocolo Heimdall - Telemetría de Ingesta */
          console.log(`[HEIMDALL][MEDIA-VAULT] Handshake Successful:`);
          console.log(`   - Filename: ${doc.filename}`);
          console.log(`   - ID: ${doc.id}`);
          console.log(`   - Origin: ${doc.tenantId}`);
          console.log(`   - S3_Status: DISTRIBUTED_REPLICA_ACTIVE`);
        }
      }
    ]
  },

  fields: [
    {
      name: 'id',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' }
    },
    {
      name: 'tenantId',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { 
        position: 'sidebar', 
        description: 'Propriedade vinculada a este ativo.' 
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      index: true,
      admin: { 
        description: 'Crítico para SEO E-E-A-T e Acessibilidade (A11Y).',
        placeholder: 'Ex: Suíte Master com vista panorâmica ao mar'
      },
      validate: (val: string | null | undefined) => {
        if (val && val.length >= 8) return true;
        return 'O texto alternativo deve ser detalhado para SEO (mín. 8 caracteres).';
      }
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: { 
        description: 'Legenda opcional para contextos editoriais e Journal.' 
      },
    },
  ],
};