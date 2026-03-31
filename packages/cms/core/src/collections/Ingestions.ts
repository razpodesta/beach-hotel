/**
 * @file packages/cms/core/src/collections/Ingestions.ts
 * @description Enterprise Data Ingestion Repository (Silo C).
 *              Orquesta el flujo de captura multi-modal (Excel, Voz, Captura)
 *              e implementa telemetría de rendimiento y validación forense
 *              para el motor de inteligencia de Marketing Cloud.
 * @version 4.0 - Enterprise Level 4.0 Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const Ingestions: CollectionConfig = {
  slug: 'ingestions',
  admin: {
    useAsTitle: 'subject',
    group: 'Data Engineering', // Nivelación Léxica
    defaultColumns: ['subject', 'type', 'channel', 'priority', 'status', 'tenant'],
    description: 'Pipeline de captura y procesamiento de activos de datos corporativos.',
  },
  
  /**
   * REGLAS DE ACCESO SOBERANO
   * El acceso de creación se mantiene abierto para integraciones (WhatsApp/Web),
   * pero blindado por el motor Multi-Tenant en lectura/escritura.
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE CICLO DE VIDA (Pipeline Hooks)
   */
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          /**
           * PROTOCOLO HEIMDALL: Telemetría de Entrada
           * @description Registra la inyección en el pipeline para auditoría de latencia.
           */
          console.log(`[HEIMDALL][PIPELINE-ENTRY] Ingestion_ID: ${doc.id} | Type: ${doc.type} | Priority: ${doc.priority}`);
        }
      }
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Data Source Identity',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'subject', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '60%', placeholder: 'Ej: Batch_Audience_Import_Q1' } 
                },
                {
                  name: 'priority',
                  type: 'select',
                  defaultValue: 'normal',
                  required: true,
                  options: [
                    { label: 'Critical (Immediate)', value: 'critical' },
                    { label: 'High Priority', value: 'high' },
                    { label: 'Normal Operation', value: 'normal' },
                    { label: 'Batch Processing', value: 'batch' }
                  ],
                  admin: { width: '40%' }
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
                    { label: 'Document (Excel/CSV)', value: 'document' },
                    { label: 'Visual Capture (OCR)', value: 'image' },
                    { label: 'Audio Intelligence', value: 'audio' },
                    { label: 'Text Stream', value: 'text' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'channel',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Web Operations Portal', value: 'web' },
                    { label: 'WhatsApp Data Sync', value: 'whatsapp' },
                    { label: 'Email Ingestion Service', value: 'email' },
                    { label: 'External Gateway API', value: 'api' }
                  ],
                  admin: { width: '33%' }
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'pending',
                  options: [
                    { label: 'Awaiting Pipeline', value: 'pending' },
                    { label: 'Processing Activity', value: 'processing' },
                    { label: 'Successfully Indexed', value: 'processed' },
                    { label: 'Validation Protocol Error', value: 'error' },
                    { label: 'Sent to AI Engine', value: 'ai_analysis' }
                  ],
                  admin: { width: '34%' }
                }
              ]
            }
          ]
        },
        {
          label: 'Payload & Transformation',
          fields: [
            { 
              name: 'rawContent', 
              type: 'textarea', 
              admin: { 
                description: 'Cuerpo original del dato o transcripción del stream.' 
              } 
            },
            { 
              name: 'asset', 
              type: 'upload', 
              relationTo: 'media', 
              admin: { description: 'Recurso binario persistido en el Repository S3.' } 
            },
            { 
              name: 'pipelineMetrics', 
              type: 'group',
              label: 'Operational Telemetry',
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
              admin: { description: 'Resultado de la transformación a formato canónico JSON.' } 
            }
          ]
        },
        {
          label: 'Infrastructure Context',
          fields: [
            { 
              name: 'tenant', 
              type: 'relationship', 
              relationTo: 'tenants', 
              required: true, 
              index: true,
              admin: { position: 'sidebar' } 
            },
            { 
              name: 'originId', 
              type: 'text', 
              admin: { description: 'External Trace ID (ej: Message_SID_WhatsApp).' } 
            },
            { 
              name: 'senderInfo', 
              type: 'json', 
              admin: { description: 'Metadatos del remitente detectados por Heimdall.' } 
            }
          ]
        }
      ]
    }
  ]
};