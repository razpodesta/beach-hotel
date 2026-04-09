/**
 * @file packages/cms/core/src/collections/Offers.ts
 * @description Motor de Gestión de Ofertas y Programas (Silo A: Revenue).
 *              Orquesta la lógica comercial con Gating de Reputación (P33).
 *              Refactorizado: Resolución de TS2322 (Async Access), purga de 
 *              importaciones huérfanas y limpieza de variables inertes.
 *              Estándar: Multi-Tenant Shield & Forensic Telemetry Heimdall v2.5.
 * @version 2.2 - Async Access Resolved & Linter Pure
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
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: OFFERS (Revenue Engine)...${C.reset}`);
}

const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// ============================================================================
// REGLAS DE ACCESO SOBERANAS (Reputation Gating)
// ============================================================================

/**
 * @function offersReadAccess
 * @description Implementa Gating por Rango. Usuarios con Nivel < 25 no pueden
 *              ver ofertas marcadas como 'elite'.
 * @fix TS2322: Implementación asíncrona para resolver promesas de baseAccess.
 */
const offersReadAccess: Access = async (args) => {
  const { req: { user } } = args;
  
  // Resolvemos el acceso multi-tenant base de forma asíncrona
  const baseAccess = await multiTenantReadAccess(args);

  // 1. Si el acceso base es booleano, respetamos la denegación o el bypass de SuperUser
  if (typeof baseAccess === 'boolean') {
    if (!baseAccess) return false;
    // Si es true (SuperUser), aún aplicamos el filtro de Tenant Maestro en este Silo
    if (user?.role === 'developer' || user?.role === 'admin') return true;
  }

  // 2. Aplicamos restricción de nivel para audiencia 'elite'
  const userLevel = Number(user?.level || 0);
  const eliteGating: Where = userLevel < 25 
    ? { audience: { not_equals: 'elite' } }
    : {};

  /**
   * @pilar III: Seguridad de Tipos.
   * Construimos el predicado final asegurando que baseAccess sea un objeto Where válido.
   */
  const tenantFilter: Where = typeof baseAccess === 'object' ? baseAccess : { tenant: { equals: MASTER_TENANT_ID } };

  return {
    and: [
      tenantFilter,
      eliteGating
    ]
  };
};

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Revenue Hooks)
// ============================================================================

const beforeChangeHook: CollectionBeforeChangeHook = async ({ req, data, operation }) => {
  const start = performance.now();
  const traceId = `off_sync_${Date.now().toString(36).toUpperCase()}`;

  // 1. Handshake de Perímetro Multi-Tenant
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
  }
  
  // 2. Autogeneración de Slug SSSoT
  if (data.title && !data.slug) {
    data.slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][REVENUE] Handshake OK | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
  }
  
  return data;
};

// ============================================================================
// DEFINICIÓN DE LA COLECCIÓN
// ============================================================================

export const Offers: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'title',
    group: 'Hospitality Assets',
    defaultColumns: ['title', 'type', 'basePrice', 'audience', 'status', 'tenant'],
    description: 'Gestão estratégica de pacotes turísticos e programas de hospitalidade.',
  },

  access: {
    read: offersReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [
      (async ({ doc, operation: _operation }) => {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`   ${C.cyan}→ [REVENUE_SYNC]${C.reset} Offer "${doc.title}" synchronized | Audience: ${doc.audience}`);
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
                  admin: { width: '30%', description: 'Ruta SEO inmutable.' } 
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
                    { label: 'Draft (Inativo)', value: 'draft' },
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
              admin: { description: 'Resumo da proposta de valor comercial.' }
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
                  admin: { width: '25%', description: 'Preço base net.' } 
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
              label: 'Matriz de Inclusões',
              labels: { singular: 'Inclusão', plural: 'Inclusões' },
              fields: [{ name: 'item', type: 'text', required: true }],
            }
          ]
        },
        {
          label: 'Fronteira Operacional',
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
                description: 'Propriedade proprietária desta oferta.'
              }
            },
            {
              name: 'heroAsset',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Imagem de impacto para o card (LCP Optimized).' }
            },
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Offers Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}