/**
 * @file packages/cms/core/src/collections/BusinessMetrics.ts
 * @description Ledger Forense y Motor de Propagación de Señales Comerciales (Silo B).
 *              Orquesta la persistencia de transacciones y dispara mutaciones en el 
 *              Protocolo 33 (XP) y el PRM (Trust Score) mediante ganchos atómicos.
 *              Refactorizado: Centinela de rentabilidad (Margin Guard), unificación 
 *              de side-effects y sellado forense Heimdall v2.5.
 *              Estándar: Forensic Reactor & Profitability Shield.
 * @version 5.0 - Margin Guard & Atomic Propagation
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
 */
import { calculateProgress } from '@metashark/protocol-33';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: BUSINESS METRICS (BI Hub)...${C.reset}`);
}

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

  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @description Sella la transacción y garantiza el aislamiento Multi-Tenant.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        
        // 1. Generación de Trace ID Inmutable
        if (operation === 'create' && !data.traceId) {
          data.traceId = `trx_${Date.now().toString(36).toUpperCase()}`;
        }

        // 2. Garantía de Perímetro (Tenant Guard)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
        }

        const duration = (performance.now() - start).toFixed(4);
        if (process.env.NODE_ENV !== 'test') {
          console.log(`${C.green}    [HEIMDALL][BI] Metadata Sealed | Trace: ${data.traceId} | Lat: ${duration}ms${C.reset}`);
        }
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange (The Reputation Reactor)
     * @description Dispara la actualización de XP, Trust Score y Alertas de Rentabilidad.
     * @pilar VIII: Resiliencia - Idempotencia absoluta.
     */
    afterChange: [
      (async ({ doc, operation, req }) => {
        if (operation !== 'create') return;
        if (doc.metaData?.propagationCompleted) return;

        const { payload } = req;
        const startReactor = performance.now();
        const traceId = doc.traceId;
        const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant;

        try {
          // --- 1. MARGIN GUARD (Profitability Centinel) ---
          const margin = Number(doc.margin || 0);
          if (doc.type === 'booking_success' && margin < 15) {
            await payload.create({
              collection: 'notifications',
              data: {
                subject: 'Alerta de Rentabilidade Baixa',
                message: `Transação ${traceId} processada com margem de ${margin}%. Verifique a estratégia de Yield.`,
                priority: 'critical',
                category: 'revenue',
                source: 'MARGIN_GUARD',
                tenant: tenantId,
                isRead: false,
              }
            });
            if (process.env.NODE_ENV !== 'test') {
              console.warn(`${C.red}   [ALERT] Low margin detected: ${margin}% | Trace: ${traceId}${C.reset}`);
            }
          }

          // --- 2. PROCESAMIENTO DE REPUTACIÓN (P33 Sync) ---
          if (doc.client && doc.type === 'booking_success') {
            const userId = typeof doc.client === 'object' ? doc.client.id : doc.client;
            const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 });
            
            if (user) {
              const xpGain = Math.floor(Number(doc.value || 0) / 10);
              const newXp = Number(user.experiencePoints || 0) + xpGain;
              const { currentLevel } = calculateProgress(newXp);

              await payload.update({
                collection: 'users',
                id: userId,
                data: { experiencePoints: newXp, level: currentLevel },
                depth: 0
              });

              // Señal al Silo D (Notificación al Huésped)
              await payload.create({
                collection: 'notifications',
                data: {
                  subject: 'XP Concedido',
                  message: `Você recebeu ${xpGain} RazTokens por sua atividade.`,
                  priority: 'low',
                  category: 'comms',
                  source: 'REPUTATION_ENGINE',
                  tenant: tenantId,
                  recipient: userId,
                  isRead: false,
                }
              });
            }
          }

          // --- 3. PROCESAMIENTO DE CREDIBILIDAD (PRM Sync) ---
          if (doc.agency && doc.type === 'booking_success') {
            const agencyId = typeof doc.agency === 'object' ? doc.agency.id : doc.agency;
            const agency = await payload.findByID({ collection: 'agencies', id: agencyId, depth: 0 });
            
            if (agency) {
              const newScore = Math.min(100, Number(agency.trustScore || 50) + 1);
              const newYield = Number(agency.totalYield || 0) + Number(doc.value || 0);

              await payload.update({
                collection: 'agencies',
                id: agencyId,
                data: { trustScore: newScore, totalYield: newYield },
                depth: 0
              });
            }
          }

          // --- 4. SELLO DE FINALIZACIÓN ---
          await payload.update({
            collection: 'business-metrics',
            id: doc.id,
            data: {
              metaData: { 
                ...doc.metaData, 
                propagationCompleted: true, 
                reactorTime: (performance.now() - startReactor).toFixed(4) 
              }
            },
            depth: 0
          });

          if (process.env.NODE_ENV !== 'test') {
            const reactorLatency = (performance.now() - startReactor).toFixed(4);
            console.log(`${C.green}   ✓ [DNA][REACTION] Atomic Sync completed in ${reactorLatency}ms${C.reset}`);
          }

        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Reactor Drift';
          console.error(`${C.red}   ✕ [DNA][CRITICAL] Reactor failure for ${traceId}: ${msg}${C.reset}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Econômico & ROI',
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
                  admin: { 
                    width: '40%',
                    description: 'Valor financeiro bruto.'
                  } 
                },
                { 
                  name: 'currency', 
                  type: 'select', 
                  defaultValue: 'BRL', 
                  required: true, 
                  options: ['BRL', 'USD', 'ARS'], 
                  admin: { width: '30%' } 
                },
                { 
                  name: 'margin', 
                  type: 'number', 
                  required: true,
                  defaultValue: 20,
                  admin: { 
                    width: '30%', 
                    description: 'Margem de lucro (%)'
                  } 
                },
              ]
            }
          ]
        },
        {
          label: 'Atribuição',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'agency', type: 'relationship', relationTo: 'agencies', required: true, index: true, admin: { width: '50%' } },
                { name: 'client', type: 'relationship', relationTo: 'users', required: true, index: true, admin: { width: '50%' } }
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'agent', type: 'relationship', relationTo: 'agents', index: true, admin: { width: '50%' } },
                { name: 'offer', type: 'relationship', relationTo: 'offers', admin: { width: '50%' } }
              ]
            }
          ]
        },
        {
          label: 'Gobernança',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'traceId', type: 'text', admin: { width: '50%', readOnly: true } },
                { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true, admin: { width: '50%', readOnly: true, position: 'sidebar' } }
              ]
            },
            { name: 'metaData', type: 'json', admin: { description: 'Dados forenses do processamento.' } }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} BI Reactor calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}