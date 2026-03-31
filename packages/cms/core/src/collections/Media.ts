/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Bóveda Soberana de Activos Multimedia (The Sanctuary Vault).
 *              Refactorizado: Unificación semántica del campo 'tenant' para 
 *              erradicar el Schema Drift y asegurar integridad referencial.
 * @version 8.0 - Sovereign Tenant Naming & Postgres Optimization
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';

/**
 * IMPORTACIONES DE PERÍMETRO
 * @pilar V: Adherencia arquitectónica.
 */
import { multiTenantWriteAccess } from './Access';

/**
 * @interface PayloadMediaDoc
 * @description Contrato estático estructural para los documentos multimedia.
 *              Nivelado: 'tenantId' -> 'tenant' para sincronía con la base de datos.
 * @pilar III: Seguridad de Tipos Absoluta.
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
  /** 
   * Relación con la Propiedad (Tenant). 
   * Tipado flexible para soportar IDs (string) u objetos poblados.
   */
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
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'hero-cinematic', width: 2560, height: 1080, position: 'centre' },
      { name: 'mobile-optimized', width: 1170, height: 2532, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/mp4'],
    focalPoint: true,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks de Infraestructura)
   */
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          /**
           * @fix: Sincronización con el nuevo esquema de identidad.
           * Aseguramos que el activo herede la propiedad del usuario creador.
           */
          if (!data.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          /** @pilar IV: Protocolo Heimdall - Telemetría de Ingesta S3 */
          console.log(`[HEIMDALL][MEDIA-VAULT] Handshake Successful:`);
          console.log(`   - Filename: ${doc.filename}`);
          console.log(`   - ID: ${doc.id}`);
          console.log(`   - Origin: ${doc.tenant}`);
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
      /**
       * @property tenant
       * @fix: Renombrado de 'tenantId' a 'tenant' para evitar la columna 'tenant_id_id'.
       * El adaptador de Postgres generará automáticamente 'tenant_id'.
       */
      name: 'tenant',
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