/**
 * @file packages/cms/core/src/collections/Media.ts
 * @description Bóveda Soberana de Activos Multimedia (The Sanctuary Vault).
 *              Orquesta la gestión de activos binarios con optimización agresiva de 
 *              entrega (LCP), aislamiento Multi-Tenant de Grado S0 y telemetría 
 *              forense Heimdall v2.5. Sincronizado con Supabase Storage (S3).
 *              Refactorizado: Resolución ESM (.js), soporte AVIF y blindaje de perímetro.
 * @version 11.1 - AVIF LCP Hardening & ESM Compliance
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook 
} from 'payload';

/** 
 * IMPORTACIONES DE PERÍMETRO SOBERANO
 * @pilar V: Adherencia Arquitectónica. Extensiones .js para rigor ESM.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

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
  assetContext?: 'branding' | 'interior' | 'event' | 'social' | 'system';
}

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall v2.5)
 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: MEDIA (Sovereign Vault)...${C.reset}`);
}

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (DNA Hooks)
// ============================================================================

/**
 * HOOK: beforeChangeHook
 * @description Sanitiza identidad, gestiona cumplimiento SEO y ancla perímetros.
 */
const beforeChangeHook: CollectionBeforeChangeHook = async ({ req, data, operation }) => {
  const start = performance.now();
  const traceId = `media_hsk_${Date.now().toString(36).toUpperCase()}`;
  
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.cyan}    [HEIMDALL][VAULT][START] Asset Handshake | ID: ${traceId}${C.reset}`);
  }

  // 1. Handshake de Propiedad (Multi-Tenant Shield)
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
      ? req.user.tenant.id 
      : req.user.tenant;
  }

  // 2. Validación de Perímetro (Anti-Orphan Guard)
  if (!data.tenant && process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY_BREACH: Media assets must be anchored to a valid Tenant ID.');
  }

  // 3. Normalización de Metadatos SEO (E-E-A-T Compliance)
  if (data.alt) {
    data.alt = data.alt.trim().substring(0, 125);
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][VAULT][END] Metadata Sealed | Time: ${duration}ms${C.reset}`);
  }
  return data;
};

const afterChangeHook: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (operation === 'create') {
    const efficiency = doc.filesize ? (doc.filesize / 1024).toFixed(2) : '0';
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `   ${C.green}✓ [S3_PERSISTED]${C.reset} File: ${C.bold}${doc.filename}${C.reset} | ` +
        `Payload: ${efficiency}KB | Dim: ${doc.width}x${doc.height}px`
      );
    }
  }
};

const afterDeleteHook: CollectionAfterDeleteHook = async ({ id, doc }) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.red}    [HEIMDALL][PURGE] Asset Eradicated | ID: ${id} | Filename: ${doc.filename}${C.reset}`);
  }
};

// ============================================================================
// APARATO PRINCIPAL: Media
// ============================================================================

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Infrastructure',
    description: 'Gestão de ativos binários de alta fidelidade sincronizados com S3 Cluster.',
    defaultColumns: ['alt', 'mimeType', 'filesize', 'tenant'],
    preview: (doc) => doc?.url as string,
  },
  
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * CONFIGURACIÓN DE INGESTA (LCP Optimization Engine)
   * @pilar X: Performance - Derivados específicos para dispositivos móviles y 4K.
   */
  upload: {
    staticDir: 'media',
    imageSizes: [
      { 
        name: 'thumbnail', 
        width: 400, 
        height: 300, 
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 80 } }
      },
      { 
        name: 'card', 
        width: 768, 
        height: 1024, 
        position: 'centre',
        /** @fix: AVIF para LCP < 1.0s en dispositivos móviles */
        formatOptions: { format: 'avif', options: { quality: 75 } } 
      },
      { 
        name: 'hero-cinematic', 
        width: 2560, 
        height: 1080, 
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 85 } } 
      },
      { 
        name: 'mobile-optimized', 
        width: 1170, 
        height: 2532, 
        position: 'centre',
        formatOptions: { format: 'avif', options: { quality: 70 } }
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/jpeg', 
      'image/png', 
      'image/webp', 
      'image/avif', 
      'video/mp4', 
      'application/pdf'
    ],
    focalPoint: true,
  },

  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [afterChangeHook],
    afterDelete: [afterDeleteHook],
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
                description: 'Crítico para SEO. Texto alternativo descriptivo (mín. 8 caracteres).',
                placeholder: 'Ej: Suíte Master Alpha - Vista Panorâmica do Mar'
              },
              validate: (val: string | null | undefined) => {
                if (val && val.length >= 8) return true;
                return 'Handshake SEO Fallido: Descripción insuficiente para indexación de élite.';
              }
            },
            {
              name: 'assetContext',
              type: 'select',
              required: true,
              defaultValue: 'interior',
              index: true, // @fix: Optimización de búsqueda por contexto
              options: [
                { label: 'Branding & Identity', value: 'branding' },
                { label: 'Hotel Interior / Suites', value: 'interior' },
                { label: 'Festival / Event Signals', value: 'event' },
                { label: 'Social & Editorial Content', value: 'social' },
                { label: 'System Infrastructure', value: 'system' }
              ],
              admin: { description: 'Categorização para o motor de busca do Silo C.' }
            },
            {
              name: 'caption',
              type: 'textarea',
              admin: { description: 'Informação editorial extendida para o Journal.' },
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
                description: 'Perímetro legal e digital proprietário.' 
              },
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              admin: {
                position: 'sidebar',
                description: 'Log inalterável de auditoria técnica.'
              }
            }
          ]
        }
      ]
    }
  ],
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Media Vault calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}