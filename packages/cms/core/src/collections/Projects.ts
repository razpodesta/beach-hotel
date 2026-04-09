/**
 * @file packages/cms/core/src/collections/Projects.ts
 * @description Registro Soberano de Activos de Ingeniería y Proyectos Digitales.
 *              Orquesta la exhibición de infraestructura con contratos de branding
 *              dinámicos, normalización de taxonomías y telemetría Heimdall v2.5.
 *              Refactorizado: Resolución de TS2305 (Exportación de tipos), 
 *              sincronización de tokens de estilo y sellado de integridad ESM.
 * @version 13.1 - Type Export Sync & Oxygen Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';

/** 
 * IMPORTACIONES DE PERÍMETRO SOBERANO
 * @pilar V: Adherencia Arquitectónica. Extensiones .js para rigor ESM.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

/**
 * CONTRATOS DE ESTRUCTURA SOBERANA
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export interface TagItem { tag: string }
export interface TechItem { technology: string }
export interface FeatureItem { feature: string }
export interface EliteOptionItem { name: string; detail: string }

/**
 * @type ProjectLayoutStyleType
 * @description Catálogo de estilos de maquetación permitidos para el motor de UI Oxygen.
 * @fix TS2305: Exportación formal para el Core Registry.
 */
export type ProjectLayoutStyleType = 'minimal' | 'immersive' | 'editorial' | 'corporate' | 'brutalist';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall v2.5)
 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', 
  blue: '\x1b[34m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: PROJECTS (Engineering Hub)...${C.reset}`);
}

// ============================================================================
// UTILIDADES ESTÁTICAS (Pilar X - Performance)
// ============================================================================

const normalizeArray = <T>(items: unknown, mapper: (val: string) => T): T[] => {
  if (!Array.isArray(items)) return [];
  return items.map(item => (typeof item === 'string' ? mapper(item) : (item as T)));
};

const generateSemanticSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Sanitización de acentos
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Hooks)
// ============================================================================

const beforeChangeHook: CollectionBeforeChangeHook = async ({ req, data, operation }) => {
  const start = performance.now();
  const traceId = `proj_sync_${Date.now().toString(36).toUpperCase()}`;

  // 1. Handshake de Propiedad (Multi-Tenant Shield)
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
  }

  // 2. Inteligencia de Rumbos
  if (data.title && !data.slug) {
    data.slug = generateSemanticSlug(data.title);
  }

  // 3. Motor de Normalización
  if (data.tags) {
    data.tags = normalizeArray<TagItem>(data.tags, (val) => ({ tag: val.toLowerCase().trim() }));
  }

  if (data.tech_stack) {
    data.tech_stack = normalizeArray<TechItem>(data.tech_stack, (val) => ({ technology: val }));
  }

  if (data.backend_architecture?.features) {
    data.backend_architecture.features = normalizeArray<FeatureItem>(
      data.backend_architecture.features, 
      (val) => ({ feature: val })
    );
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][PROJECT] Sync OK | ID: ${traceId} | Time: ${duration}ms${C.reset}`);
  }
  
  return data;
};

// ============================================================================
// DEFINICIÓN DE LA COLECCIÓN
// ============================================================================

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: 'Hospitality Assets',
    defaultColumns: ['title', 'status', 'reputationWeight', 'tenant'],
    description: 'Catálogo de infraestruturas digitais e ativos de alta engenharia.',
  },
  
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [
      (async ({ doc, operation }) => {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`   ${C.cyan}→ [ASSET_SYNC]${C.reset} "${doc.title}" synchronized | Op: ${operation}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade & Mídia',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                { name: 'slug', type: 'text', unique: true, required: true, index: true, admin: { width: '30%' } },
              ]
            },
            { name: 'description', type: 'textarea', required: true },
            { 
              name: 'mainImage', 
              type: 'upload', 
              relationTo: 'media',
              required: true, 
              admin: { description: 'Ativo visual de alta fidelidade (S3 Vault).' } 
            },
            {
              type: 'row',
              fields: [
                { name: 'liveUrl', type: 'text', admin: { width: '50%' } },
                { name: 'codeUrl', type: 'text', admin: { width: '50%' } },
              ]
            },
            { 
              name: 'tags', 
              type: 'array', 
              required: true, 
              labels: { singular: 'Tag', plural: 'Taxonomia' },
              fields: [{ name: 'tag', type: 'text', required: true }],
            }
          ],
        },
        {
          label: 'Especificações',
          fields: [
            {
              name: 'introduction',
              type: 'group',
              required: true,
              fields: [
                { name: 'heading', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true }
              ]
            },
            {
              name: 'tech_stack',
              type: 'array',
              required: true,
              labels: { singular: 'Tecnología', plural: 'Stack Tecnológico' },
              fields: [{ name: 'technology', type: 'text', required: true }]
            },
            {
              name: 'elite_options',
              type: 'array',
              label: 'Funcionalidades Elite',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'detail', type: 'text', required: true, admin: { width: '60%' } }
                  ]
                }
              ]
            },
            {
              name: 'backend_architecture',
              type: 'group',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
                { 
                  name: 'features', 
                  type: 'array', 
                  fields: [{ name: 'feature', type: 'text', required: true }] 
                }
              ]
            }
          ]
        },
        {
          label: 'Oxygen & Reputação',
          fields: [
            {
              name: 'branding',
              type: 'group',
              required: true,
              fields: [
                { 
                  name: 'primary_color', 
                  type: 'text', 
                  required: true,
                  defaultValue: '#A855F7',
                  admin: { description: 'Cor de acento (Space OKLCH support).' }
                },
                { 
                  name: 'layout_style', 
                  type: 'select', 
                  required: true, 
                  defaultValue: 'editorial',
                  options: [
                    { label: 'Minimal', value: 'minimal' },
                    { label: 'Immersive', value: 'immersive' },
                    { label: 'Editorial', value: 'editorial' },
                    { label: 'Corporate', value: 'corporate' },
                    { label: 'Brutalist', value: 'brutalist' }
                  ] 
                }
              ]
            },
            { name: 'reputationWeight', type: 'number', defaultValue: 50, required: true }
          ]
        },
        {
          label: 'Gobernança',
          fields: [
            { 
              name: 'tenant', 
              type: 'relationship', 
              relationTo: 'tenants',
              required: true,
              index: true, 
              admin: { position: 'sidebar', readOnly: true } 
            },
            {
              name: 'status',
              type: 'select',
              defaultValue: 'draft',
              required: true,
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' }
              ],
              admin: { position: 'sidebar' }
            }
          ]
        }
      ]
    }
  ],
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Projects collection sealed | Time: ${collectionDuration.toFixed(4)}ms\n`);
}