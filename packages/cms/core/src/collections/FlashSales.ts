/**
 * @file packages/cms/core/src/collections/FlashSales.ts
 * @description Enterprise Revenue Catalyst Engine (Silo A).
 *              Orquesta la gestión de inventario táctico con lógica de urgencia,
 *              expiración cronológica y Gating de Reputación P33.
 *              Refactorizado: Resolución de accesos asíncronos, sincronización 
 *              atmosférica Oxygen y telemetría Heimdall v2.5.
 *              Estándar: Multi-Tenant Shield & Forensic Inventory Control.
 * @version 6.0 - Reputation Gating & Atmosphere Sync
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type Access, 
  type Where, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';

/** 
 * IMPORTACIONES DE PERÍMETRO SOBERANO
 * @pilar V: Adherencia Arquitectónica. Extensiones .js para rigor ESM.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: FLASH SALES (Revenue Catalyst)...${C.reset}`);
}

// const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// ============================================================================
// REGLAS DE ACCESO SOBERANAS (Reputation Catalyst)
// ============================================================================

/**
 * @function flashSalesReadAccess
 * @description Implementa acceso privilegiado. Ofertas 'vip' requieren Nivel >= 15.
 * @pilar III: Seguridad de Tipos e Integridad de Perímetro.
 */
const flashSalesReadAccess: Access = async (args): Promise<boolean | Where> => {
  const { req: { user } } = args;
  
  // 1. Handshake de perímetro asíncrono
  const baseAccess = await multiTenantReadAccess(args);
  if (typeof baseAccess === 'boolean') return baseAccess;

  // 2. Bypass total para la jerarquía de ingeniería (S0/S1)
  if (user?.role === 'developer' || user?.role === 'admin') return baseAccess;

  // 3. Gating de Reputación P33
  const userLevel = Number(user?.level || 0);
  const vipGating: Where = userLevel < 15 
    ? { audience: { not_equals: 'vip' } }
    : {};

  return {
    and: [
      baseAccess,
      vipGating
    ]
  };
};

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Catalyst Hooks)
// ============================================================================

const beforeChangeCatalyst: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  const start = performance.now();
  const traceId = `fls_sync_${Date.now().toString(36).toUpperCase()}`;

  // 1. Inyección de Perímetro (Tenant Guard)
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
  }

  // 2. Inteligencia de Slugificación
  if (data.title && !data.slug) {
    data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }

  // 3. Auditoría de Integridad de Inventario
  if (Number(data.currentStock) > Number(data.totalInventory)) {
    data.currentStock = data.totalInventory;
  }

  // 4. Motor de Estados Cronológico
  const now = new Date();
  const expirationDate = new Date(data.expiresAt);

  if (expirationDate < now) {
    data.status = 'expired';
  } else if (Number(data.currentStock) === 0) {
    data.status = 'sold_out';
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][CATALYST] Logic Synchronized | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
  }

  return data;
};

// ============================================================================
// DEFINICIÓN DE LA COLECCIÓN
// ============================================================================

export const FlashSales: CollectionConfig = {
  slug: 'flash-sales',
  admin: {
    useAsTitle: 'title',
    group: 'Revenue Operations',
    defaultColumns: ['title', 'status', 'currentStock', 'audience', 'tenant'],
    description: 'Gestão automatizada de ofertas de curta duração e alta conversão.',
  },

  access: {
    read: flashSalesReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    beforeChange: [beforeChangeCatalyst],
    afterChange: [
      (async ({ doc, operation, previousDoc }) => {
        if (operation === 'update' && doc.currentStock !== previousDoc?.currentStock) {
           const throughput = Number(previousDoc?.currentStock || 0) - Number(doc.currentStock);
           if (process.env.NODE_ENV !== 'test') {
             console.log(`   ${C.cyan}→ [INVENTORY_PULSE]${C.reset} Asset: ${doc.slug} | Throughput: ${throughput} | Left: ${doc.currentStock}`);
           }
           
           // Alerta de Inventario Crítico al Hub de Comunicaciones
           if (doc.currentStock <= 3 && doc.status === 'active') {
             console.error(`${C.red}${C.bold}    [CRITICAL_STOCK] Boundary Limit Reached: ${doc.title}${C.reset}`);
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
          label: 'Estratégia & Atmosfera',
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
                  admin: { width: '30%', description: 'ID Semântico para rumbos SEO.' } 
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
                    { label: 'Agências B2B (Partner Only)', value: 'agents' },
                    { label: 'VIP Protocol 33 (Lvl 15+)', value: 'vip' }
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
                  name: 'vibe', 
                  type: 'select', 
                  required: true, 
                  defaultValue: 'day',
                  options: [
                    { label: 'Atmosfera: Dia (Luz)', value: 'day' },
                    { label: 'Atmosfera: Noite (Santuário)', value: 'night' }
                  ], 
                  admin: { width: '34%', description: 'Define o tema visual do ativo.' }
                },
              ]
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: { description: 'Micro-copy de impacto tático.' }
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
              admin: { description: 'Imagem de alta fidelidade para impacto visual.' }
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
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Flash Sales Catalyst calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}