/**
 * @file packages/cms/core/src/collections/BusinessMetrics.ts
 * @description Ledger Forense y Motor de Propagación de Señales Comerciales (Silo B).
 *              Orquesta la persistencia de transacciones y dispara mutaciones en el 
 *              Protocolo 33 (XP) y el PRM (Trust Score) mediante ganchos atómicos.
 *              Refactorizado: Integración de Signal Hooks, trazabilidad cruzada 
 *              y normalización de Yield.
 * @version 3.0 - Sovereign Intelligence Engine (Heimdall Injected)
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';
import { calculateProgress } from '@metashark/protocol-33';

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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: BUSINESS METRICS (BI Hub)...${C.reset}`);

/**
 * APARATO: BusinessMetrics
 * @description Centro de mando para el análisis de conversión y fidelización.
 */
export const BusinessMetrics: CollectionConfig = {
  slug: 'business-metrics',
  admin: {
    useAsTitle: 'traceId',
    group: 'Supply Chain / Partners',
    defaultColumns: ['type', 'agency', 'value', 'status', 'tenant'],
    description: 'Ledger de transações com motor de propagação de reputação ativo.',
  },

  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Inmutabilidad. La creación es operativa, el borrado es forense (Solo Developer).
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE SEÑAL Y REACCIÓN (Intelligence Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Sella la transacción con un Trace ID único y ancla el perímetro.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        
        if (operation === 'create' && !data.traceId) {
          data.traceId = `trx_${Date.now().toString(36).toUpperCase()}`;
        }

        console.log(`${C.blue}    [HEIMDALL][BI][START] Sealing Transaction | Trace: ${data.traceId}${C.reset}`);

        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][BI][END] Logic Anchored | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange (The Reactor)
     * @description Dispara la actualización de XP del usuario y el scoring de la agencia.
     * @pilar IX: Desacoplamiento de lógica mediante señales.
     */
    afterChange: [
      (async ({ doc, operation, req }) => {
        if (operation !== 'create') return;

        const { payload } = req;
        const startReactivity = performance.now();
        console.log(`${C.cyan}   → [REACTOR] Signal detected: ${doc.type}. Triggering chain reactions...${C.reset}`);

        try {
          // 1. PROPAGACIÓN HACIA EL USUARIO (Protocolo 33 XP)
          if (doc.client && doc.type === 'booking_success') {
            const userId = typeof doc.client === 'object' ? doc.client.id : doc.client;
            const user = await payload.findByID({ collection: 'users', id: userId });
            
            if (user) {
              const currentXp = Number(user.experiencePoints || 0);
              // Calculamos XP basada en el valor de la transacción (1 XP por cada 10 BRL como base)
              const xpGain = Math.floor(doc.value / 10);
              const newXp = currentXp + xpGain;
              const { currentLevel } = calculateProgress(newXp);

              await payload.update({
                collection: 'users',
                id: userId,
                data: { experiencePoints: newXp, level: currentLevel }
              });
              console.log(`      ${C.green}✓ [XP_SYNC]${C.reset} User ${user.email} reached Lvl ${currentLevel} (+${xpGain} XP)`);
            }
          }

          // 2. PROPAGACIÓN HACIA LA AGENCIA (PRM Trust Score)
          if (doc.agency && doc.type === 'booking_success') {
            const agencyId = typeof doc.agency === 'object' ? doc.agency.id : doc.agency;
            const agency = await payload.findByID({ collection: 'agencies', id: agencyId });
            
            if (agency) {
              // Incremento de confianza por cada venta exitosa (Max 100)
              const newScore = Math.min(100, Number(agency.trustScore || 50) + 1);
              const currentYield = Number(agency.totalYield || 0) + doc.value;

              await payload.update({
                collection: 'agencies',
                id: agencyId,
                data: { trustScore: newScore, totalYield: currentYield }
              });
              console.log(`      ${C.green}✓ [PRM_SYNC]${C.reset} Agency ${agency.brandName} yield updated: ${currentYield}`);
            }
          }

          const reactorDuration = performance.now() - startReactivity;
          console.log(`${C.green}   ✓ [DNA][REACTION] Chain reaction completed in ${reactorDuration.toFixed(4)}ms${C.reset}`);

        } catch (error) {
          console.error(`${C.red}   ✕ [DNA][CRITICAL] Chain reaction aborted:`, error);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Econômico & Status',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'type', 
                  type: 'select', 
                  required: true, 
                  options: [
                    { label: 'Reserva Confirmada (Yield)', value: 'booking_success' },
                    { label: 'Cancelamento / Estorno', value: 'booking_failed' },
                    { label: 'Lead Qualificado (CRM)', value: 'inquiry' },
                    { label: 'Comissão Paga', value: 'commission_payout' }
                  ],
                  admin: { width: '50%' }
                },
                { 
                  name: 'status', 
                  type: 'select', 
                  defaultValue: 'processed',
                  required: true,
                  options: [
                    { label: 'Finalizado', value: 'processed' },
                    { label: 'Em Análise', value: 'pending' },
                    { label: 'Erro de Conciliação', value: 'error' }
                  ],
                  admin: { width: '50%' }
                }
              ]
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'value', 
                  type: 'number', 
                  required: true,
                  admin: { width: '50%', description: 'Valor financeiro da transação.' } 
                },
                { 
                  name: 'currency', 
                  type: 'select', 
                  defaultValue: 'BRL',
                  required: true,
                  options: ['BRL', 'USD', 'ARS', 'EUR'],
                  admin: { width: '50%' } 
                }
              ]
            }
          ]
        },
        {
          label: 'Atribuição Digital',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'agency', 
                  type: 'relationship', 
                  relationTo: 'agencies', 
                  required: true, 
                  index: true,
                  admin: { width: '50%' } 
                },
                { 
                  name: 'client', 
                  type: 'relationship', 
                  relationTo: 'users', 
                  required: true, 
                  index: true,
                  admin: { width: '50%', description: 'Destinatário dos pontos de reputação (XP).' } 
                }
              ]
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'agent', 
                  type: 'relationship', 
                  relationTo: 'agents', 
                  index: true,
                  admin: { width: '50%' } 
                },
                { 
                  name: 'offer', 
                  type: 'relationship', 
                  relationTo: 'offers',
                  admin: { width: '50%', description: 'Produto ou pacote comercial vinculado.' }
                }
              ]
            }
          ]
        },
        {
          label: 'Forense & Infra',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'traceId', 
                  type: 'text', 
                  admin: { width: '50%', readOnly: true, description: 'ID inalterável de auditoria.' } 
                },
                { 
                  name: 'tenant', 
                  type: 'relationship', 
                  relationTo: 'tenants', 
                  required: true, 
                  index: true,
                  admin: { width: '50%', readOnly: true, position: 'sidebar' } 
                }
              ]
            },
            { 
              name: 'metaData', 
              type: 'json', 
              admin: { description: 'Payload técnico (External IDs, Gateway logs).' } 
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Metrics Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);