/**
 * @file packages/cms/core/src/collections/Ingestions.ts
 * @description Enterprise Data Ingestion Repository (Silo C).
 *              Orquesta el flujo de captura multi-modal y el pipeline de transformación.
 *              Implementa trazabilidad forense, métricas de rendimiento industrial,
 *              y aislamiento Multi-Tenant de Grado S0.
 * @version 5.0 - DNA Ingestion Standard (Heimdall v2.0 Injected)
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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: INGESTIONS (Data Engineering Hub)...${C.reset}`);

/**
 * APARATO: Ingestions
 * @description Orquestador de la ingesta de activos de inteligencia corporativa.
 */
export const Ingestions: CollectionConfig = {
  slug: 'ingestions',
  admin: {
    useAsTitle: 'subject',
    group: 'Data Engineering',
    defaultColumns: ['subject', 'type', 'status', 'priority', 'tenant', 'createdAt'],
    description: 'Pipeline central de captura e processamento de inteligência de dados.',
  },
  
  /**
   * REGLAS DE ACCESO SOBERANO
   * @pilar VIII: Resiliencia y Seguridad Perimetral.
   * La creación se mantiene abierta para S2S (Server-to-Server) handshakes, 
   * pero la lectura está blindada por Tenant.
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, 
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE CICLO DE VIDA (Pipeline Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Inyecta Trace IDs, garantiza el perímetro de propiedad y prepara el handshake.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        
        // 1. Generación de Trace ID Inmutable (Forensic Token)
        if (operation === 'create' && !data.traceId) {
          data.traceId = `ing_${Date.now().toString(36).toUpperCase()}`;
        }

        console.log(`${C.blue}    [HEIMDALL][PIPELINE][START] Handshake Initiated | ID: ${data.traceId}${C.reset}`);

        // 2. Garantía de Perímetro Multi-Tenant
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
          console.log(`       [INFO] Pipeline entry auto-anchored to Tenant: ${data.tenant}`);
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][PIPELINE][END] Metadata Sealed | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Reporta la inyección exitosa en el clúster de inteligencia.
     */
    afterChange: [
      (async ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`   ${C.cyan}→ [DATA_INGESTED]${C.reset} New node in Silo C: ${doc.subject} | Channel: ${doc.channel} | Trace: ${doc.traceId}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade da Fonte',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'subject', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '65%', placeholder: 'Ej: Batch_Audience_Sync_Q2' } 
                },
                {
                  name: 'priority',
                  type: 'select',
                  defaultValue: 'normal',
                  required: true,
                  options: [
                    { label: 'Crítico (Imediato)', value: 'critical' },
                    { label: 'Alta Prioridade', value: 'high' },
                    { label: 'Normal', value: 'normal' },
                    { label: 'Lote (Batch)', value: 'batch' }
                  ],
                  admin: { width: '35%' }
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
                    { label: 'Documento (Excel/CSV)', value: 'document' },
                    { label: 'Captura Visual (OCR)', value: 'image' },
                    { label: 'Inteligência de Voz', value: 'audio' },
                    { label: 'Fluxo de Texto', value: 'text' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'channel',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Portal de Operações', value: 'web' },
                    { label: 'WhatsApp Sync', value: 'whatsapp' },
                    { label: 'Email Gateway', value: 'email' },
                    { label: 'API Externa', value: 'api' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'pending',
                  required: true,
                  options: [
                    { label: 'Aguardando Pipeline', value: 'pending' },
                    { label: 'Processando Atividade', value: 'processing' },
                    { label: 'Indexado com Sucesso', value: 'processed' },
                    { label: 'Erro de Protocolo', value: 'error' },
                    { label: 'Análise de IA', value: 'ai_analysis' }
                  ],
                  admin: { width: '34%' }
                }
              ]
            }
          ]
        },
        {
          label: 'Payload & Transformação',
          fields: [
            { 
              name: 'rawContent', 
              type: 'textarea', 
              admin: { description: 'Conteúdo original ou transcrição bruta do sinal.' } 
            },
            { 
              name: 'asset', 
              type: 'upload', 
              relationTo: 'media', 
              admin: { description: 'Recurso binário persistido no S3 Cluster.' } 
            },
            { 
              name: 'pipelineMetrics', 
              type: 'group',
              label: 'Telemetria Operacional',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'executionTimeMs', type: 'number', admin: { width: '33%', readOnly: true } },
                    { name: 'itemsProcessed', type: 'number', admin: { width: '33%', readOnly: true } },
                    { name: 'errorCount', type: 'number', admin: { width: '34%', readOnly: true } }
                  ]
                }
              ]
            },
            { 
              name: 'processedData', 
              type: 'json', 
              admin: { description: 'Estrutura canônica JSON resultante do processamento.' } 
            }
          ]
        },
        {
          label: 'IA & Intelligence Insights',
          fields: [
            {
              name: 'aiSummary',
              type: 'textarea',
              admin: { description: 'Resumo executivo gerado por modelos de lenguaje.' }
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'confidenceScore', 
                  type: 'number', 
                  min: 0, 
                  max: 100, 
                  admin: { width: '50%', description: 'Nivel de certeza de la extracción IA (0-100).' } 
                },
                { 
                  name: 'entitiesDetected', 
                  type: 'array', 
                  admin: { width: '50%' },
                  fields: [{ name: 'entity', type: 'text' }],
                  labels: { singular: 'Entidade', plural: 'Entidades Detectadas' }
                }
              ]
            }
          ]
        },
        {
          label: 'Infraestrutura & Trace',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'traceId', 
                  type: 'text', 
                  admin: { width: '50%', readOnly: true, description: 'Token de rastreio inalterável.' } 
                },
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
            { 
              name: 'originId', 
              type: 'text', 
              admin: { description: 'External Ref ID (WhatsApp SID, Email Message-ID).' } 
            },
            { 
              name: 'senderInfo', 
              type: 'json', 
              admin: { description: 'Metadados do agente ou sistema emissor.' } 
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Ingestion Hub calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);