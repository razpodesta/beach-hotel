/**
 * @file packages/cms/core/src/collections/DynamicRoutes.ts
 * @description Orquestador de Enrutamiento Dinámico e Inteligente (Gateway Silo).
 *              Gestiona puntos de acceso físicos (QRs) con lógica condicional.
 *              Refactorizado: Resolución de TS2322 (Strict Validation Types)
 *              y nivelación de observabilidad Heimdall.
 * @version 3.1 - Type-Safe Gateway Standard
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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: DYNAMIC ROUTES (Gateway)...${C.reset}`);

/**
 * HELPER: validateTimeFormat
 * @description Valida el formato HH:mm cumpliendo con el contrato de Payload 3.0.
 * @fix TS2322: Maneja la unión de tipos string | string[] | null | undefined.
 */
const validateTimeFormat = (val: string | string[] | null | undefined): true | string => {
  if (!val) return true; // El campo es opcional a nivel de esquema
  if (typeof val !== 'string') return 'Tipo de dato inválido';
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(val) || 'Formato de tiempo inválido (HH:mm)';
};

/**
 * APARATO PRINCIPAL: DynamicRoutes
 */
export const DynamicRoutes: CollectionConfig = {
  slug: 'dynamic-routes',
  admin: {
    useAsTitle: 'internalReference',
    group: 'Infrastructure',
    description: 'Puntos de acceso inteligentes. Mapeo de QRs y rumbos condicionales.',
    defaultColumns: ['internalReference', 'routeKey', 'fallbackUrl', 'tenant'],
  },
  
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'developer',
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @pilar IV: Observabilidad - Trazabilidad de latencia en la sincronización de rumbos.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        const traceId = `gw_sync_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][GATEWAY][START] Syncing Route Logic | ID: ${traceId}${C.reset}`);

        // 1. Inyección de Perímetro (Tenant Shield)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 2. Sanitización de Route Key (URL Safe)
        if (data.routeKey) {
          data.routeKey = data.routeKey.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][GATEWAY][END] Protocol Ready | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    afterChange: [
      (async ({ doc, operation }) => {
        console.log(`   ${C.cyan}→ [GATEWAY_UPDATE]${C.reset} Route /r/${doc.routeKey} mapped to ${doc.fallbackUrl} | Op: ${operation}`);
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad del Punto',
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
                    placeholder: 'Ej: Tótem Recepción - Desayuno/Cena' 
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
                    description: 'Ruta final: hotel.com/r/[routeKey]' 
                  } 
                },
              ]
            },
            { 
              name: 'fallbackUrl', 
              type: 'text', 
              required: true, 
              admin: { 
                description: 'URL de destino predeterminada (si no se cumplen reglas horarias).' 
              } 
            },
          ]
        },
        {
          label: 'Inteligencia Condicional',
          fields: [
            {
              name: 'conditionalRules',
              type: 'array',
              label: 'Algoritmos de Redirección',
              labels: {
                singular: 'Regla Horaria/Nivel',
                plural: 'Reglas de Enrutamiento'
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
                        width: '25%',
                        description: 'Formato HH:mm' 
                      },
                      validate: validateTimeFormat
                    },
                    { 
                      name: 'endTime', 
                      type: 'text', 
                      admin: { 
                        placeholder: '11:00', 
                        width: '25%',
                        description: 'Formato HH:mm'
                      },
                      validate: validateTimeFormat
                    },
                    { 
                      name: 'destinationUrl', 
                      type: 'text', 
                      required: true, 
                      admin: { 
                        width: '50%',
                        placeholder: '/desayuno-gourmet'
                      } 
                    }
                  ]
                },
                {
                  name: 'requiredLoyaltyLevel',
                  type: 'number',
                  defaultValue: 0,
                  admin: { 
                    description: 'Nivel mínimo del Protocolo 33 requerido para este rumbo.' 
                  }
                }
              ]
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
                description: 'Perímetro físico-digital de este punto de acceso.'
              }
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Gateway Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);