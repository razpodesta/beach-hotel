/**
 * @file packages/cms/core/src/collections/Notifications.ts
 * @description Ledger Forense de Notificaciones y Señales Operativas (Silo D).
 *              Refactorizado: Gestión de retención inmutable, indexación táctica,
 *              telemetría Heimdall v2.5 y optimización de metadatos técnicos.
 *              Estándar: Forensic Trace & Multi-Tenant Shield.
 * @version 3.2 - Retention Hardened & Metadata Optimized
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook,
  type Access
} from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/**
 * @interface Notification
 * @description Contrato soberano de datos para una transmisión del Ledger.
 */
export interface Notification {
  id: string;
  subject: string;
  category: 'security' | 'ops' | 'revenue' | 'comms' | 'infra';
  priority: 'low' | 'high' | 'critical';
  source: string;
  message: string;
  actionUrl?: string;
  traceId: string;
  originNode?: string;
  isRead: boolean;
  recipient?: string | { id: string };
  metadata?: Record<string, unknown>;
  tenant: string | { id: string };
  expiresAt: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: NOTIFICATIONS (Forensic Ledger)...${C.reset}`);
}

/**
 * APARATO: Notifications
 * @description Registro inmutable de señales operativas y alertas de salud.
 */
export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'subject',
    group: 'Infrastructure',
    defaultColumns: ['subject', 'category', 'priority', 'source', 'isRead', 'tenant'],
    description: 'Registro soberano de sinais operacionais e alertas de infraestrutura.',
  },

  /** 
   * @pilar VIII: Resiliencia - Auditoría inmutable.
   * Solo el rol 'developer' (Nivel S0) tiene autoridad para purgar el Ledger.
   */
  access: {
    read: multiTenantReadAccess,
    create: (() => true) as Access, 
    update: multiTenantWriteAccess,
    delete: (({ req: { user } }) => user?.role === 'developer') as Access,
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @description Orquestación de metadatos forenses y política de retención inmutable.
     */
    beforeChange: [
      (async ({ data, operation, req, originalDoc }) => {
        const start = performance.now();
        
        // 1. Handshake de Trace ID (Inmutable por diseño)
        if (operation === 'create' && !data.traceId) {
          data.traceId = `sig_${Date.now().toString(36).toUpperCase()}`;
        }

        // 2. Inyección de Perímetro Multi-Tenant (Shield)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 3. Motor de Retención Inteligente (Auto-Purge Strategy)
        if (operation === 'create' && !data.expiresAt) {
          const now = new Date();
          let days = 15; // Retención base
          if (data.priority === 'high') days = 45;
          if (data.priority === 'critical') days = 730; // 2 años de rastro legal
          data.expiresAt = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString();
        }

        // 4. Dispatcher de Lectura
        if (operation === 'update' && data.isRead && !originalDoc.isRead) {
          data.readAt = new Date().toISOString();
        }

        const duration = (performance.now() - start).toFixed(4);
        if (process.env.NODE_ENV !== 'test') {
          console.log(`${C.magenta}[DNA][SIGNAL]${C.reset} Node Processed: ${C.cyan}${data.traceId}${C.reset} | Lat: ${duration}ms`);
        }
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Alerta inmediata ante incidencias críticas.
     */
    afterChange: [
      (async ({ doc, operation }) => {
        if (operation === 'create' && doc.priority === 'critical') {
           console.error(`\n${C.red}${C.bold}[CRITICAL_INCIDENT]${C.reset} [${doc.source}] ${doc.subject}`);
           console.error(`↳ Trace: ${doc.traceId} | Perimeter: ${doc.tenant}\n`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade da Sinal',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'subject', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '60%', placeholder: 'Breve resumo do evento' } 
                },
                {
                  name: 'category',
                  type: 'select',
                  required: true,
                  defaultValue: 'ops',
                  index: true,
                  options: [
                    { label: 'Segurança (Shield)', value: 'security' },
                    { label: 'Operações (Node)', value: 'ops' },
                    { label: 'Revenue (Profit)', value: 'revenue' },
                    { label: 'Comunicação (Comms)', value: 'comms' },
                    { label: 'Infraestrutura (Cloud)', value: 'infra' }
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
                  index: true,
                  options: [
                    { label: 'Normal (L0)', value: 'low' },
                    { label: 'Elevada (L1)', value: 'high' },
                    { label: 'Crítica (L2)', value: 'critical' }
                  ],
                  admin: { width: '50%' }
                },
                { name: 'source', type: 'text', required: true, admin: { width: '50%', placeholder: 'SYSTEM_NODE_ALPHA' } }
              ]
            },
            { name: 'message', type: 'textarea', required: true, admin: { description: 'Detalhes forenses da sinalização.' } },
            { name: 'actionUrl', type: 'text', admin: { description: 'Link para resolução imediata.' } }
          ]
        },
        {
          label: 'Rastreabilidade & Dados',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'traceId', type: 'text', unique: true, admin: { width: '50%', readOnly: true } },
                { name: 'originNode', type: 'text', admin: { width: '50%', description: 'IP ou Contexto do despachador.' } }
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'isRead', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
                { name: 'recipient', type: 'relationship', relationTo: 'users', admin: { width: '50%', description: 'Destinatário opcional.' } }
              ]
            },
            { 
              name: 'metadata', 
              type: 'json', 
              admin: { 
                description: 'Payload técnico bruto.',
                condition: (data) => !!data.metadata 
              } 
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
                description: 'Perímetro proprietário.'
              }
            },
            {
              name: 'expiresAt',
              type: 'date',
              index: true,
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                description: 'Data do Auto-Purge industrial.' 
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
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Notifications Ledger calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}