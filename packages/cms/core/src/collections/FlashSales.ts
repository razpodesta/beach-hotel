/**
 * @file packages/cms/core/src/collections/FlashSales.ts
 * @description Enterprise Revenue Catalyst Engine (Silo A).
 *              Orquesta la gestión de inventario táctico con lógica de urgencia,
 *              expiración cronológica y control de agotamiento automatizado.
 *              Implementa telemetría Heimdall v2.0 para auditoría de conversión.
 * @version 5.0 - Forensic Revenue Standard (Heimdall Injected)
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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: FLASH SALES (Revenue Catalyst)...${C.reset}`);

/**
 * APARATO: FlashSales
 * @description Gestión de ofertas de alta velocidad con gating por audiencia.
 */
export const FlashSales: CollectionConfig = {
  slug: 'flash-sales',
  admin: {
    useAsTitle: 'title',
    group: 'Revenue Operations',
    defaultColumns: ['title', 'status', 'currentStock', 'audience', 'tenant'],
    description: 'Gestão automatizada de ofertas de curta duração e alta conversão.',
  },

  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Resiliencia y Aislamiento Perimetral.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer', // Preservación de histórico de Revenue
  },

  /**
   * GUARDIANES DE CICLO DE VIDA (Catalyst Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Orquesta la automatización de estados, trazabilidad y blindaje perimetral.
     */
    beforeChange: [
      (async ({ data, operation, req, originalDoc }) => {
        const start = performance.now();
        const traceId = `fls_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][CATALYST][START] Evaluating Flash Strategy | ID: ${traceId}${C.reset}`);

        // 1. Handshake de Perímetro Multi-Tenant
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 2. Inteligencia de Slugificación
        if (data.title && typeof data.title === 'string' && !data.slug) {
          data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        // 3. Auditoría de Integridad de Inventario
        if (data.currentStock > data.totalInventory) {
          console.warn(`       ${C.yellow}[CORRECTION]${C.reset} currentStock capped at totalInventory.`);
          data.currentStock = data.totalInventory;
        }

        // 4. Motor de Estados Automatizado (Business Logic Pulse)
        const now = new Date();
        const expirationDate = new Date(data.expiresAt);

        if (expirationDate < now) {
          data.status = 'expired';
        } else if (data.currentStock === 0) {
          data.status = 'sold_out';
        } else if (operation === 'update' && originalDoc?.status === 'draft' && data.status !== 'draft') {
          // Registro de lanzamiento
          console.log(`       ${C.green}[LIVE_DEPLOY]${C.reset} Offer ${data.slug} is now ON-AIR.`);
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][CATALYST][END] Logic Synchronized | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Emite alertas de inventario crítico al log de infraestructura.
     */
    afterChange: [
      (async ({ doc, operation, previousDoc }) => {
        if (operation === 'update' && doc.currentStock !== previousDoc?.currentStock) {
           const depletion = previousDoc?.currentStock - doc.currentStock;
           console.log(`   ${C.cyan}→ [INVENTORY_PULSE]${C.reset} Asset: ${doc.slug} | Sold: ${depletion} | Left: ${doc.currentStock}`);
           
           // Alerta de Inventario Crítico
           if (doc.currentStock <= 3 && doc.status === 'active') {
             console.error(`${C.red}${C.bold}    [CRITICAL_STOCK] Low inventory detected in Catalyst Node: ${doc.title}${C.reset}`);
           }
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Estratégia & Conversão',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '70%', placeholder: 'Ej: Madrugada Explosiva - 40% OFF' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  index: true, 
                  admin: { width: '30%', description: 'ID Semântico para rumbos de alta conversão.' } 
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'audience',
                  type: 'select',
                  required: true,
                  defaultValue: 'public',
                  options: [
                    { label: 'Público Geral (B2C)', value: 'public' },
                    { label: 'Agências B2B (Flash Wholesale)', value: 'agents' },
                    { label: 'VIP Protocol 33 Only', value: 'vip' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'draft',
                  required: true,
                  options: [
                    { label: 'Draft (Inativo)', value: 'draft' },
                    { label: 'Active (On Air)', value: 'active' },
                    { label: 'Sold Out (Esgotado)', value: 'sold_out' },
                    { label: 'Expired (Finalizado)', value: 'expired' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'priority',
                  type: 'number',
                  defaultValue: 1,
                  admin: { width: '34%', description: 'Orden de visualización (1: Max).' }
                }
              ]
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: { description: 'Micro-copy de impacto para gatilho de compra.' }
            },
          ]
        },
        {
          label: 'Yield & Timeline',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'basePrice', type: 'number', required: true, admin: { width: '50%', description: 'Preço cheio.' } },
                { name: 'discountValue', type: 'number', required: true, min: 1, max: 99, admin: { width: '50%', description: 'Desconto (%)' } }
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'totalInventory', type: 'number', required: true, admin: { width: '33%', description: 'Lote total.' } },
                { name: 'currentStock', type: 'number', required: true, admin: { width: '33%', description: 'Disponível agora.' } },
                { 
                  name: 'expiresAt', 
                  type: 'date', 
                  required: true, 
                  admin: { 
                    width: '34%', 
                    date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM HH:mm' } 
                  } 
                },
              ]
            },
            { 
              name: 'heroAsset', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
              admin: { description: 'Imagem de alta fidelidad para carrosséis de impacto.' }
            },
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
              admin: { position: 'sidebar', readOnly: true } 
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              admin: { description: 'Log interno de performance da campanha (Staff Only).' }
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Flash Sales Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);