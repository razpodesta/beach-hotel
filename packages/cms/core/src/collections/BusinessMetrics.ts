/**
 * @file packages/cms/core/src/collections/BusinessMetrics.ts
 * @description Ledger Forense y Motor de Propagación de Señales Comerciales (Silo B).
 *              Orquesta la persistencia de transacciones y dispara mutaciones en el 
 *              Protocolo 33 (XP) y el PRM (Trust Score) mediante ganchos atómicos.
 *              Refactorizado: Resolución de TS2307 via infra, optimización de 
 *              queries (depth: 0) y telemetría Heimdall v2.5.
 * @version 4.1 - Forensic Reactor Standard (Linter Pure)
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/** 
 * IMPORTACIÓN DE MOTOR LÓGICO (SSoT)
 * @fix TS2307: Sincronizado mediante referencias en tsconfig.json.
 */
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
 * @description Centro de mando para el análisis de ROI y la gamificación operativa.
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
   * @pilar VIII: Inmutabilidad de Auditoría. Solo Developer purga el Ledger.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE CICLO DE VIDA (Forensic Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Sella la transacción con un Trace ID y ancla el perímetro Multi-Tenant.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        
        // 1. Generación de Trace ID Inmutable
        if (operation === 'create' && !data.traceId) {
          data.traceId = `trx_${Date.now().toString(36).toUpperCase()}`;
        }

        console.log(`${C.blue}    [HEIMDALL][BI][START] Sealing Transaction | Trace: ${data.traceId}${C.reset}`);

        // 2. Garantía de Perímetro (Tenant Guard)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][BI][END] Metadata Anchored | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange (The Reputation Reactor)
     * @description Dispara la actualización de XP y Trust Score en una sola fase atómica.
     * @pilar IX: Desacoplamiento de lógica mediante señales reactivas.
     */
    afterChange: [
      (async ({ doc, operation, req }) => {
        if (operation !== 'create') return;

        const { payload } = req;
        const startReactor = performance.now();
        const traceId = doc.traceId;

        console.log(`${C.cyan}   → [REACTOR] Signal detected: ${doc.type}. Initializing chain reaction...${C.reset}`);

        try {
          // --- 1. TRANSMUTACIÓN DE REPUTACIÓN (Usuario / Protocolo 33) ---
          if (doc.client && doc.type === 'booking_success') {
            const userId = typeof doc.client === 'object' ? doc.client.id : doc.client;
            
            /** 
             * @pilar X: Performance. 
             * Query optimizada con depth: 0 para evitar carga de tenants/media 
             * innecesaria durante el cálculo matemático.
             */
            const user = await payload.findByID({ 
              collection: 'users', 
              id: userId,
              depth: 0 
            });
            
            if (user) {
              const currentXp = Number(user.experiencePoints || 0);
              // Lógica de recompensa: 1 XP por cada 10 unidades de valor (BRL/USD base)
              const xpGain = Math.floor(Number(doc.value || 0) / 10);
              const newXp = currentXp + xpGain;
              
              // Handshake con el motor lógico del protocolo
              const { currentLevel } = calculateProgress(newXp);

              await payload.update({
                collection: 'users',
                id: userId,
                data: { experiencePoints: newXp, level: currentLevel },
                depth: 0
              });
              console.log(`      ${C.green}✓ [XP_SYNC]${C.reset} Trace: ${traceId} | User Levelled Up to ${currentLevel} (+${xpGain} XP)`);
            }
          }

          // --- 2. TRANSMUTACIÓN DE CREDIBILIDAD (Agencia / PRM) ---
          if (doc.agency && doc.type === 'booking_success') {
            const agencyId = typeof doc.agency === 'object' ? doc.agency.id : doc.agency;
            
            const agency = await payload.findByID({ 
              collection: 'agencies', 
              id: agencyId,
              depth: 0 
            });
            
            if (agency) {
              // Incremento de Trust Score (Capped a 100) y actualización de Yield total
              const newScore = Math.min(100, Number(agency.trustScore || 50) + 1);
              const newYield = Number(agency.totalYield || 0) + Number(doc.value || 0);

              await payload.update({
                collection: 'agencies',
                id: agencyId,
                data: { trustScore: newScore, totalYield: newYield },
                depth: 0
              });
              console.log(`      ${C.green}✓ [PRM_SYNC]${C.reset} Trace: ${traceId} | Agency Yield Updated: ${newYield}`);
            }
          }

          const reactorLatency = (performance.now() - startReactor).toFixed(4);
          console.log(`${C.green}   ✓ [DNA][REACTION] Chain reaction completed for ${traceId} in ${reactorLatency}ms${C.reset}`);

        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Reactor Drift';
          console.error(`${C.red}   ✕ [DNA][CRITICAL] Chain reaction failed for ${traceId}: ${msg}${C.reset}`);
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
                  admin: { width: '50%', description: 'Destinatário dos puntos de reputación (XP).' } 
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
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Metrics Hub calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);