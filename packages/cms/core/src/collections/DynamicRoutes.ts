/**
 * @file packages/cms/core/src/collections/DynamicRoutes.ts
 * @description Orquestador de Enrutamiento Dinámico e Inteligente (Gateway Silo).
 *              Gestiona puntos de acceso físicos (QRs) con lógica condicional.
 *              Refactorizado: Resolución ESM (.js), blindaje de llaves reservadas,
 *              validación forense de tiempo y optimización P33.
 *              Estándar: Heimdall v2.5 Forensic Logging & Multi-Tenant Shield.
 * @version 3.2 - Reserved Keys Shield & ESM Compliance
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
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: DYNAMIC ROUTES (Gateway)...${C.reset}`);
}

// ============================================================================
// VALIDADORES DE ÉLITE (Business Logic Guards)
// ============================================================================

/**
 * @function validateTimeFormat
 * @description Valida el contrato HH:mm (24h) con feedback forense.
 */
const validateTimeFormat = (val: string | string[] | null | undefined): true | string => {
  if (!val) return true;
  if (typeof val !== 'string') return 'Dato no reconocido como protocolo de tiempo.';
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(val) || 'Formato INVÁLIDO. Use HH:mm (ej: 07:30, 23:15).';
};

/**
 * @constant RESERVED_KEYS
 * @description Rumbos prohibidos para evitar el secuestro de rutas críticas.
 */
const RESERVED_KEYS = ['admin', 'api', 'portal', 'auth', 'media', 'sitemap', 'robots', 'login', 'join'];

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Gateway Hooks)
// ============================================================================

const beforeChangeHook: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  const start = performance.now();
  const traceId = `gw_sync_${Date.now().toString(36).toUpperCase()}`;

  // 1. Handshake de Perímetro (Tenant Guard)
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
  }

  // 2. Sanitización y Gating de Route Key
  if (data.routeKey) {
    const cleanKey = data.routeKey.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    if (RESERVED_KEYS.includes(cleanKey)) {
      throw new Error(`SECURITY_ERR: La llave '${cleanKey}' es una ruta reservada del sistema.`);
    }
    
    data.routeKey = cleanKey;
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][GATEWAY] Handshake OK | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
  }
  
  return data;
};

// ============================================================================
// APARATO PRINCIPAL: DynamicRoutes
// ============================================================================

export const DynamicRoutes: CollectionConfig = {
  slug: 'dynamic-routes',
  admin: {
    useAsTitle: 'internalReference',
    group: 'Infrastructure',
    description: 'Pontos de acesso inteligentes e mapeamento de rumbos dinâmicos.',
    defaultColumns: ['internalReference', 'routeKey', 'fallbackUrl', 'tenant'],
  },
  
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'developer',
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [
      (async ({ doc, operation }) => {
        if (process.env.NODE_ENV !== 'test') {
          const rulesCount = doc.conditionalRules?.length || 0;
          console.log(
            `   ${C.cyan}→ [GATEWAY_UPDATE]${C.reset} /r/${doc.routeKey} calibrated | ` +
            `Rules: ${rulesCount} | Op: ${operation}`
          );
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade do Ponto',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'internalReference', 
                  type: 'text', 
                  required: true, 
                  admin: { 
                    width: '60%',
                    placeholder: 'Ej: Tótem Recepción - Buffet' 
                  } 
                },
                { 
                  name: 'routeKey', 
                  type: 'text', 
                  unique: true, 
                  index: true,
                  required: true, 
                  admin: { 
                    width: '40%',
                    description: 'hotel.com/r/[routeKey]' 
                  } 
                },
              ]
            },
            { 
              name: 'fallbackUrl', 
              type: 'text', 
              required: true, 
              admin: { 
                description: 'URL de destino padrão se as regras não forem atendidas.' 
              } 
            },
          ]
        },
        {
          label: 'Inteligência Condicional',
          fields: [
            {
              name: 'conditionalRules',
              type: 'array',
              label: 'Algoritmos de Redirecionamento',
              labels: {
                singular: 'Regra de Contexto',
                plural: 'Regras de Enrutamento'
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { 
                      name: 'startTime', 
                      type: 'text', 
                      admin: { 
                        placeholder: '07:00', 
                        width: '25%' 
                      },
                      validate: validateTimeFormat
                    },
                    { 
                      name: 'endTime', 
                      type: 'text', 
                      admin: { 
                        placeholder: '11:00', 
                        width: '25%' 
                      },
                      validate: validateTimeFormat
                    },
                    { 
                      name: 'destinationUrl', 
                      type: 'text', 
                      required: true, 
                      admin: { 
                        width: '50%',
                        placeholder: '/desayuno'
                      } 
                    }
                  ]
                },
                {
                  name: 'requiredLoyaltyLevel',
                  type: 'number',
                  defaultValue: 0,
                  index: true, // @fix: Optimización de filtrado P33
                  admin: { 
                    description: 'Nível mínimo do Protocolo 33 para ativar esta regra.' 
                  }
                }
              ]
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
                description: 'Perímetro proprietário do ponto.'
              }
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Gateway Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}