/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Bóveda Soberana de Activos Multimedia (The Sanctuary Vault).
 *              Orquesta la gestión de activos binarios con optimización de entrega (LCP),
 *              aislamiento Multi-Tenant de Grado S0 y telemetría forense Heimdall.
 *              Sincronizado con Supabase Storage (S3 Protocol).
 * @version 10.0 - Forensic S3 Asset Orchestrator
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook 
} from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/**
 * @interface PayloadMediaDoc
 * @description Contrato de identidad para los documentos de la bóveda multimedia.
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
  tenant?: string | { id: string } | null; 
  caption?: string | null;
}

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const collectionStart = performance.now();
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: MEDIA (The Sanctuary Vault)...${C.reset}`);

/**
 * APARATO PRINCIPAL: Media
 * @description Gestión de activos con soporte para procesamiento dinámico de imágenes.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Infrastructure',
    description: 'Bóveda centralizada de activos de alta fidelidad. Sincronizada con S3.',
    defaultColumns: ['alt', 'filename', 'mimeType', 'tenant'],
    preview: (doc) => doc?.url as string,
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Aislamiento absoluto. Un activo solo es visible si es público 
   * o si pertenece al Tenant de la sesión activa.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * CONFIGURACIÓN DE INGESTA (Upload Engine)
   * @description Define los derivados de imagen para maximizar el Core Web Vital LCP.
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
    mimeTypes: ['image/*', 'video/mp4', 'application/pdf'],
    focalPoint: true,
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @description Garantiza el Handshake de Propiedad y normaliza metadatos SEO.
     */
    beforeChange: [
      (async ({ req, data, operation }) => {
        const start = performance.now();
        const traceId = `media_ingest_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][VAULT][START] Ingesting Asset | ID: ${traceId} | Op: ${operation}${C.reset}`);

        // 1. Inyección Forzada de Tenant (Security Perimeter)
        if (operation === 'create' && req.user) {
          const userTenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
          
          if (!data.tenant) {
            data.tenant = userTenant;
            console.log(`       [INFO] Asset auto-linked to Tenant: ${userTenant}`);
          }
        }

        // 2. Normalización de Alt Text (SEO Compliance)
        if (data.alt) {
          data.alt = data.alt.trim();
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][VAULT][END] Metadata Prepared | Time: ${duration.toFixed(4)}ms${C.reset}`);
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Reporta la persistencia física en el Clúster S3.
     */
    afterChange: [
      (async ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`   ${C.cyan}→ [S3_SYNC]${C.reset} File physically persisted: ${doc.filename} | Size: ${doc.filesize} bytes`);
        }
      }) as CollectionAfterChangeHook,
    ],

    /**
     * HOOK: afterDelete
     * @description Trazabilidad de Purga. Notifica la eliminación de un activo del ecosistema.
     */
    afterDelete: [
      (async ({ id, doc }) => {
        console.log(`${C.red}    [HEIMDALL][PURGE] Asset Eradicated | ID: ${id} | Filename: ${doc.filename}${C.reset}`);
      }) as CollectionAfterDeleteHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Asset Intelligence',
          fields: [
            {
              name: 'alt',
              type: 'text',
              required: true,
              index: true,
              admin: { 
                description: 'Crítico para SEO E-E-A-T. Describa el activo para motores de búsqueda y accesibilidad.',
                placeholder: 'Ej: Suíte Master Alpha - Vista Panorámica del Mar de Canasvieiras'
              },
              validate: (val: string | null | undefined) => {
                if (val && val.length >= 8) return true;
                return 'Handshake SEO Fallido: El texto alternativo debe ser descriptivo (mín. 8 caracteres).';
              }
            },
            {
              name: 'caption',
              type: 'textarea',
              admin: { 
                description: 'Información editorial extendida (Journal/Blog captions).' 
              },
            },
          ]
        },
        {
          label: 'Infrastructure Details',
          fields: [
            {
              name: 'tenant',
              type: 'relationship',
              relationTo: 'tenants',
              required: true,
              index: true,
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                description: 'Propietario legal y digital de este activo multimedia.' 
              },
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              admin: {
                position: 'sidebar',
                description: 'Notas internas de auditoría técnica (Solo Staff).'
              }
            }
          ]
        }
      ]
    }
  ],
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Media Vault calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);