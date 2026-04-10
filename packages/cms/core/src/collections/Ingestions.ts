/**
 * @file packages/cms/core/src/collections/Ingestions.ts
 * @description Enterprise Data Ingestion Repository (Silo C).
 *              Orquesta el flujo de captura multi-modal y el pipeline de transformación.
 *              Refactorizado: Sincronía con IngestionManager v5.6, estructuración 
 *              de métricas de rendimiento, ledger de anomalías e integración con Silo D.
 *              Estándar: Heimdall v2.5 Forensic Ingestion & Multi-Tenant Shield.
 * @version 6.0 - Intelligence Metrics & Silo Convergence
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
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: INGESTIONS (Data Engineering)...${C.reset}`);
}

/**
 * APARATO: Ingestions
 * @description Centro de persistencia para el pipeline de transmutación de datos.
 */
export const Ingestions: CollectionConfig = {
  slug: 'ingestions',
  admin: {
    useAsTitle: 'subject',
    group: 'Data Engineering',
    defaultColumns: ['subject', 'type', 'status', 'tenant', 'createdAt'],
    description: 'Pipeline central de captura e processamento de inteligência de dados.',
  },
  
  access: {
    read: multiTenantReadAccess,
    create: () => true, // Acceso S2S (Server-to-Server)
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @description Inyecta metadatos forenses y garantiza el aislamiento Multi-Tenant.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        
        // 1. Generación de Trace ID Inmutable
        if (operation === 'create' && !data.traceId) {
          data.traceId = `ing_${Date.now().toString(36).toUpperCase()}`;
        }

        // 2. Handshake de Perímetro Multi-Tenant
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
        }

        const duration = (performance.now() - start).toFixed(4);
        if (process.env.NODE_ENV !== 'test') {
          console.log(`${C.cyan}    [HEIMDALL][PIPELINE] Metadata Sealed | Trace: ${data.traceId} | Lat: ${duration}ms${C.reset}`);
        }
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange (Convergence Trigger)
     * @description Notifica al Silo D (CommsHub) sobre el resultado de la misión de ingesta.
     */
    afterChange: [
      (async ({ doc, operation, req }) => {
        if (operation !== 'create') return;

        /**
         * @step Signal Generation
         * Determinamos la prioridad basada en anomalías detectadas.
         */
        const hasAnomalies = Number(doc.pipelineMetrics?.failedRows || 0) > 0;
        const totalInjected = Number(doc.pipelineMetrics?.nodesInjected || 0);

        try {
          await req.payload.create({
            collection: 'notifications',
            data: {
              subject: `Pipeline Ingestión: ${doc.subject}`,
              message: `Misión ${doc.traceId} completada. Nodos: ${totalInjected}. Anomalías: ${doc.pipelineMetrics?.failedRows || 0}.`,
              priority: hasAnomalies ? 'high' : 'low',
              category: 'ops',
              source: 'INGESTION_ENGINE',
              tenant: typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant,
              isRead: false,
              metadata: { ingestionId: doc.id, traceId: doc.traceId }
            }
          });
        } catch {
          console.error(`${C.red}   ✕ [SILO_D_LINK_FAILED] Unable to log ingestion result.${C.reset}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade da Missão',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'subject', type: 'text', required: true, admin: { width: '70%' } },
                {
                  name: 'priority',
                  type: 'select',
                  defaultValue: 'normal',
                  options: [
                    { label: 'Crítico', value: 'critical' },
                    { label: 'Alta', value: 'high' },
                    { label: 'Normal', value: 'normal' }
                  ],
                  admin: { width: '30%' }
                }
              ]
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'type', 
                  type: 'select', 
                  required: true,
                  options: [
                    { label: 'Excel/CSV', value: 'document' },
                    { label: 'OCR Image', value: 'image' },
                    { label: 'Voice Ingest', value: 'audio' },
                    { label: 'Raw Text', value: 'text' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'channel',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Portal', value: 'web' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'API', value: 'api' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'pending',
                  required: true,
                  options: [
                    { label: 'Waiting', value: 'pending' },
                    { label: 'Processing', value: 'processing' },
                    { label: 'Processed', value: 'processed' },
                    { label: 'Error', value: 'error' }
                  ],
                  admin: { width: '34%' }
                }
              ]
            }
          ]
        },
        {
          label: 'Métricas & Anomalias',
          fields: [
            {
              name: 'pipelineMetrics',
              type: 'group',
              label: 'Indicadores Industriais',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'nodesInjected', type: 'number', defaultValue: 0, admin: { width: '25%' } },
                    { name: 'duplicatesSkipped', type: 'number', defaultValue: 0, admin: { width: '25%' } },
                    { name: 'failedRows', type: 'number', defaultValue: 0, admin: { width: '25%' } },
                    { name: 'executionTimeMs', type: 'number', admin: { width: '25%' } }
                  ]
                }
              ]
            },
            {
              name: 'issues',
              type: 'array',
              label: 'Ledger de Anomalias',
              labels: { singular: 'Incidente', plural: 'Incidentes Detectados' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'row', type: 'number', admin: { width: '20%' } },
                    { name: 'error', type: 'text', admin: { width: '80%' } }
                  ]
                },
                { name: 'data', type: 'json', admin: { description: 'Payload original da linha con erro.' } }
              ]
            }
          ]
        },
        {
          label: 'Forense & Trace',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'traceId', type: 'text', admin: { width: '50%', readOnly: true } },
                { 
                  name: 'tenant', 
                  type: 'relationship', 
                  relationTo: 'tenants', 
                  required: true, 
                  index: true,
                  admin: { width: '50%', position: 'sidebar', readOnly: true } 
                }
              ]
            },
            { name: 'processedData', type: 'json', admin: { description: 'Snapshot JSON do resultado.' } },
            { name: 'senderInfo', type: 'json' }
          ]
        }
      ]
    }
  ],
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Ingestions Engine calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}