/**
 * @file packages/cms/core/src/collections/Offers.ts
 * @description Motor de Gestión de Ofertas, Paquetes y Programas (Silo A: Revenue).
 *              Orquesta la lógica comercial, segmentación de audiencia y validez 
 *              cronológica con aislamiento Multi-Tenant de grado industrial.
 *              Implementa el Protocolo Heimdall para trazabilidad de inventario.
 * @version 2.0 - Enterprise Revenue Intelligence Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: OFFERS (Revenue Engine)...${C.reset}`);

/**
 * APARATO: Offers
 * @description Gestión estratégica de activos de venta directa y alianzas B2B.
 */
export const Offers: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'title',
    group: 'Hospitality Assets',
    defaultColumns: ['title', 'type', 'basePrice', 'audience', 'status', 'tenant'],
    description: 'Gestão estratégica de pacotes turísticos, programas e ofertas flash.',
  },

  /**
   * REGLAS DE ACCESO (Aislamiento Multi-Tenant)
   * @pilar VIII: Resiliencia y Seguridad Perimetral.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE CICLO DE VIDA (Revenue Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Orquesta la integridad relacional, slugificación y validación de fechas.
     */
    beforeChange: [
      (async ({ req, data, operation }) => {
        const start = performance.now();
        const traceId = `offer_sync_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][REVENUE][START] Syncing Offer Data | ID: ${traceId}${C.reset}`);

        // 1. Garantía Multi-Tenant (Handshake de Propiedad)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }
        
        // 2. Autogeneración de Slug SSSoT
        if (data.title && typeof data.title === 'string' && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // 3. Validación Cronológica (Business Logic Guard)
        if (data.validFrom && data.validUntil) {
          const startD = new Date(data.validFrom);
          const endD = new Date(data.validUntil);
          if (endD <= startD) {
            throw new Error('REVENUE_ERR: La fecha de fin debe ser posterior a la de inicio.');
          }
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][REVENUE][END] Offer Synthesized | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Telemetría de disponibilidad comercial.
     */
    afterChange: [
      (async ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`   ${C.cyan}→ [REVENUE_UPDATE]${C.reset} Offer "${doc.title}" is ${doc.status} | Audience: ${doc.audience}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Estratégia de Venda',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '70%', placeholder: 'Ej: Madrugada Explosiva - Suite Master' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  index: true, 
                  admin: { width: '30%', description: 'ID Semântico para rumbos SEO.' } 
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  defaultValue: 'package',
                  options: [
                    { label: 'Pacote (Estadia)', value: 'package' },
                    { label: 'Programa (Atividade)', value: 'program' },
                    { label: 'Promoção (Oferta Flash)', value: 'promo' },
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'audience',
                  type: 'select',
                  required: true,
                  defaultValue: 'public',
                  options: [
                    { label: 'Público Geral (B2C)', value: 'public' },
                    { label: 'Agências B2B (Wholesale)', value: 'agents' },
                    { label: 'Elite Protocol 33 (Lvl 25+)', value: 'elite' },
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'draft',
                  options: [
                    { label: 'Rascunho (Privado)', value: 'draft' },
                    { label: 'Ativo (Publicado)', value: 'published' },
                    { label: 'Esgotado', value: 'sold_out' },
                  ],
                  admin: { width: '34%' }
                }
              ]
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: { description: 'Resumo executivo da proposta de valor.' }
            },
          ]
        },
        {
          label: 'Yield & Logística',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'nightsCount', 
                  type: 'number', 
                  min: 1, 
                  defaultValue: 1, 
                  admin: { width: '25%', description: 'Mínimo de noites.' } 
                },
                { 
                  name: 'basePrice', 
                  type: 'number', 
                  required: true, 
                  admin: { width: '25%', description: 'Preço base sem impostos.' } 
                },
                { 
                  name: 'currency', 
                  type: 'select', 
                  defaultValue: 'BRL', 
                  options: ['BRL', 'USD', 'ARS'], 
                  admin: { width: '25%' } 
                },
                {
                  name: 'maxCapacity',
                  type: 'number',
                  defaultValue: 0,
                  admin: { width: '25%', description: 'Vagas totais (0 = ilimitado).' }
                }
              ]
            },
            {
              name: 'inclusions',
              type: 'array',
              label: 'Matriz de Inclusões (Luxe)',
              labels: { singular: 'Inclusão', plural: 'Inclusões' },
              fields: [{ name: 'item', type: 'text', required: true }],
              admin: { description: 'Ex: Café da manhã gourmet, Transfer in/out, Late check-out.' }
            }
          ]
        },
        {
          label: 'Fronteiras e Ativos',
          fields: [
            {
              name: 'heroAsset',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Imagem de impacto para a galeria de ofertas (LCP Optimized).' }
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'validFrom', 
                  type: 'date', 
                  admin: { 
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' }
                  } 
                },
                { 
                  name: 'validUntil', 
                  type: 'date', 
                  admin: { 
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' }
                  } 
                },
              ]
            },
            {
              name: 'bookingPolicy',
              type: 'textarea',
              admin: { description: 'Termos e condições específicos (Cancelamento, No-Show).' }
            }
          ]
        },
        {
          label: 'Infraestructura',
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
                description: 'Propriedade proprietária desta oferta comercial.'
              }
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Revenue Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);