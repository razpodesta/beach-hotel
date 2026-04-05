/**
 * @file packages/cms/core/src/collections/Projects.ts
 * @description Registro Soberano de Activos de Ingeniería y Proyectos Digitales.
 *              Orquesta la exhibición de infraestructura con contratos de branding
 *              dinámicos, normalización de taxonomías y telemetría Heimdall v2.0.
 *              Refactorizado: Migración de imageUrl a relación atómica con Media (S3),
 *              unificación de estilos Oxygen y blindaje perimetral Multi-Tenant.
 * @version 12.0 - Sovereign Asset Standard (Heimdall Injected)
 * @author Raz Podestá - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/**
 * CONTRATOS DE ESTRUCTURA SOBERANA
 * @description Define los tipos internos para la normalización de campos complejos.
 */
export interface TagItem { tag: string }
export interface TechItem { technology: string }
export interface FeatureItem { feature: string }

/**
 * @type ProjectLayoutStyleType
 * @description Catálogo de estilos de maquetación permitidos para el motor de UI Oxygen.
 */
export type ProjectLayoutStyleType = 'minimal' | 'immersive' | 'editorial' | 'corporate' | 'brutalista';

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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: PROJECTS (Engineering Registry)...${C.reset}`);

/**
 * APARATO: Projects
 * @description Colección estratégica para el posicionamiento E-E-A-T de la marca y el hotel.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: 'Hospitality Assets',
    defaultColumns: ['title', 'status', 'reputationWeight', 'tenant'],
    description: 'Catálogo de infraestruturas digitais e ativos de alta engenharia.',
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Resiliencia y Aislamiento Perimetral.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Engineering Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Orquesta la normalización de taxonomías y la inyección de identidad.
     */
    beforeChange: [
      (async ({ req, data, operation }) => {
        const start = performance.now();
        const traceId = `proj_sync_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][PROJECT][START] Normalizing Asset Data | ID: ${traceId}${C.reset}`);

        // 1. Garantía Multi-Tenant (Perimeter Guard)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
          console.log(`       [INFO] Asset auto-linked to Tenant: ${data.tenant}`);
        }

        // 2. Slugificación Automática Sanitizada
        if (data.title && typeof data.title === 'string' && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // 3. Motor de Normalización "Mirror Sync"
        const normalizeArray = <T>(items: unknown, mapper: (val: string) => T): T[] => {
          if (!Array.isArray(items)) return [];
          return items.map(item => typeof item === 'string' ? mapper(item) : (item as T));
        };

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

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][PROJECT][END] Asset Levelled | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Reporta la sincronización del activo al Ledger de infraestructura.
     */
    afterChange: [
      (async ({ doc, operation }) => {
        console.log(`   ${C.cyan}→ [ASSET_SYNC]${C.reset} Project "${doc.title}" is ${doc.status} | Op: ${operation} | Trace: ${Date.now()}`);
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
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '70%', placeholder: 'Nombre del Activo de Ingeniería' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  required: true, 
                  index: true, 
                  admin: { width: '30%', description: 'ID Semântico para rumbos SEO.' } 
                },
              ]
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: { description: 'Resumo técnico de alto nível para o portfólio.' }
            },
            { 
              /**
               * @property mainImage
               * @fix: Migración de 'imageUrl' (text) a relación Upload (S3).
               * Esto garantiza optimización de entrega y soberanía de activos.
               */
              name: 'mainImage', 
              type: 'upload', 
              relationTo: 'media',
              required: true, 
              admin: { description: 'Ativo visual principal (LCP optimized via Media Vault).' } 
            },
            {
              type: 'row',
              fields: [
                { name: 'liveUrl', type: 'text', admin: { width: '50%', placeholder: 'https://demo-instance.metashark.tech' } },
                { name: 'codeUrl', type: 'text', admin: { width: '50%', placeholder: 'GitHub / GitLab Repository' } },
              ]
            },
            { 
              name: 'tags', 
              type: 'array', 
              required: true, 
              labels: { singular: 'Tag', plural: 'Taxonomia de Engenharia' },
              fields: [{ name: 'tag', type: 'text', required: true }],
            }
          ],
        },
        {
          label: 'Especificações de Elite',
          fields: [
            {
              name: 'introduction',
              type: 'group',
              required: true,
              fields: [
                { name: 'heading', type: 'text', required: true, admin: { placeholder: 'Desafio de Arquitetura' } },
                { name: 'body', type: 'textarea', required: true, admin: { placeholder: 'Narrativa técnica detalhada...' } }
              ]
            },
            {
              name: 'tech_stack',
              type: 'array',
              required: true,
              labels: { singular: 'Tecnologia', plural: 'Stack Tecnológico' },
              fields: [{ name: 'technology', type: 'text', required: true }]
            },
            {
              name: 'backend_architecture',
              type: 'group',
              fields: [
                { name: 'title', type: 'text', required: true, admin: { placeholder: 'Serverless / Microservices / Monolith' } },
                { name: 'description', type: 'textarea' },
                { 
                  name: 'features', 
                  type: 'array', 
                  labels: { singular: 'Capacidade', plural: 'Capacidades de Backend' },
                  fields: [{ name: 'feature', type: 'text', required: true }] 
                }
              ]
            }
          ]
        },
        {
          label: 'Oxygen Engine & Reputação',
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
                  admin: { description: 'Cor de acento do ativo (Space OKLCH support).' }
                },
                { 
                  name: 'layout_style', 
                  type: 'select', 
                  required: true, 
                  defaultValue: 'editorial',
                  options: [
                    { label: 'Minimal (Clean)', value: 'minimal' },
                    { label: 'Immersive (Full 3D)', value: 'immersive' },
                    { label: 'Editorial (Luxury Journal)', value: 'editorial' },
                    { label: 'Corporate (Dashboard)', value: 'corporate' },
                    { label: 'Brutalista (Engineering Raw)', value: 'brutalista' }
                  ] 
                }
              ]
            },
            { 
              name: 'reputationWeight', 
              type: 'number', 
              defaultValue: 50, 
              required: true,
              admin: { description: 'Experiência (RZB) gerada pela interação com este ativo.' }
            }
          ]
        },
        {
          label: 'Infraestrutura',
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
                description: 'Propriedade proprietária deste nó de engenharia.'
              } 
            },
            {
              name: 'status',
              type: 'select',
              defaultValue: 'draft',
              required: true,
              options: [
                { label: 'Rascunho (Privado)', value: 'draft' },
                { label: 'Publicado (Live Showcase)', value: 'published' }
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
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Projects Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);