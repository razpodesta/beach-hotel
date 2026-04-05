/**
 * @file packages/cms/core/src/collections/Notifications.ts
 * @description Ledger Forense de Notificaciones y Señales Operativas (Silo D).
 *              Orquesta la persistencia de alertas de infraestructura, mensajes 
 *              entre nodos y telemetría de errores con purga automática.
 *              Refactorizado: Auto-generación de Trace IDs, lógica de retención 
 *              dinámica y observabilidad Heimdall v2.0.
 * @version 2.0 - Forensic Nerve System Standard
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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: NOTIFICATIONS (Signal Ledger)...${C.reset}`);

/**
 * APARATO: Notifications
 * @description Centro de persistencia para el Comms Hub y el sistema de alertas críticas.
 */
export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'subject',
    group: 'Infrastructure',
    defaultColumns: ['subject', 'category', 'priority', 'source', 'isRead', 'tenant'],
    description: 'Registro inmutable de señales operativas y alertas de salud del sistema.',
  },

  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Resiliencia y Auditoría.
   * La creación está abierta para inyección de logs (S2S), la lectura limitada por Tenant.
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, 
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer', // Las evidencias solo las purga Dev
  },

  /**
   * GUARDIANES DE SEÑAL (Forensic Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Orquesta la inyección de metadatos técnicos y la política de retención.
     */
    beforeChange: [
      (async ({ data, operation, req, originalDoc }) => {
        const start = performance.now();
        
        // 1. Handshake de Trace ID (Inalterable)
        if (operation === 'create' && !data.traceId) {
          data.traceId = `sig_${Date.now().toString(36).toUpperCase()}`;
        }

        console.log(`${C.blue}    [HEIMDALL][SIGNAL][START] Processing Transmission | ID: ${data.traceId}${C.reset}`);

        // 2. Inyección de Perímetro Multi-Tenant
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 3. Motor de Retención Inteligente (Auto-Purge Logic)
        if (operation === 'create') {
          const now = new Date();
          let days = 15; // Buffer estándar
          if (data.priority === 'high') days = 45;
          if (data.priority === 'critical') days = 365 * 2; // Auditoría legal (2 años)

          data.expiresAt = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString();
        }

        // 4. Dispatcher de Lectura (Timestamping)
        if (operation === 'update' && data.isRead && !originalDoc.isRead) {
          data.readAt = new Date().toISOString();
          console.log(`       ${C.green}[READ_CONFIRMED]${C.reset} Operator acknowledged signal.`);
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][SIGNAL][END] Node Ready | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Alerta inmediata en logs de servidor ante anomalías críticas.
     */
    afterChange: [
      (async ({ doc, operation }) => {
        if (operation === 'create' && doc.priority === 'critical') {
           console.error(`\n${C.red}${C.bold}    [CRITICAL_INCIDENT] [${doc.source}] ${doc.subject}${C.reset}`);
           console.error(`    ↳ Trace: ${doc.traceId} | Path: /r/${doc.source}\n`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad de la Señal',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'subject', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '60%', placeholder: 'Breve descripción del evento' } 
                },
                {
                  name: 'category',
                  type: 'select',
                  required: true,
                  defaultValue: 'ops',
                  options: [
                    { label: 'Seguridad (Shield)', value: 'security' },
                    { label: 'Operaciones (Node)', value: 'ops' },
                    { label: 'Revenue (Profit)', value: 'revenue' },
                    { label: 'Comunicación (Comms)', value: 'comms' },
                    { label: 'Infraestructura (Cloud)', value: 'infra' }
                  ],
                  admin: { width: '40%' }
                }
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'priority',
                  type: 'select',
                  required: true,
                  defaultValue: 'low',
                  options: [
                    { label: 'Normal (L0)', value: 'low' },
                    { label: 'Elevada (L1)', value: 'high' },
                    { label: 'Crítica (L2)', value: 'critical' }
                  ],
                  admin: { width: '50%' }
                },
                { name: 'source', type: 'text', required: true, admin: { width: '50%', placeholder: 'REVENUE_CORE / EDGE_GATEWAY' } }
              ]
            },
            { name: 'message', type: 'textarea', required: true, admin: { description: 'Detalle forense de la señal.' } },
            { name: 'actionUrl', type: 'text', admin: { description: 'Link directo para resolver la incidencia.' } }
          ]
        },
        {
          label: 'Trazabilidad Forense',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'traceId', type: 'text', admin: { width: '50%', readOnly: true, description: 'Token de auditoría inmutable.' } },
                { name: 'originNode', type: 'text', admin: { width: '50%', description: 'IP o Contexto del despachador.' } }
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'isRead', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
                { name: 'recipient', type: 'relationship', relationTo: 'users', admin: { width: '50%', description: 'Destinatario específico (opcional).' } }
              ]
            },
            { name: 'metadata', type: 'json', admin: { description: 'Payload técnico crudo (Error stacks, JSON inputs).' } }
          ]
        },
        {
          label: 'Infraestructura & Purga',
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
                description: 'Perímetro propietario de la notificación.'
              }
            },
            {
              name: 'expiresAt',
              type: 'date',
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                description: 'Data programada para el Auto-Purge industrial.' 
              }
            },
            { name: 'readAt', type: 'date', admin: { position: 'sidebar', readOnly: true } }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Notification Ledger calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);