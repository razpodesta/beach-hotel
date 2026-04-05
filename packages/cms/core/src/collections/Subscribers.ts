/**
 * @file packages/cms/core/src/collections/Subscribers.ts
 * @description Centro de Inteligencia de Leads y Ciclo de Vida del Huésped (CRM Hub).
 *              Orquesta la persistencia de identidades, gestión de consentimiento
 *              y métricas de engagement con aislamiento Multi-Tenant de Grado S0.
 *              Refactorizado: Normalización de identidad, cumplimiento LGPD,
 *              y telemetría Heimdall v2.0 para auditoría de ingesta.
 * @version 3.0 - Enterprise CRM Standard (Forensic Ready)
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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: SUBSCRIBERS (CRM Node)...${C.reset}`);

/**
 * APARATO: Subscribers
 * @description Única fuente de verdad para la audiencia del ecosistema MetaShark.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Management',
    defaultColumns: ['email', 'status', 'engagementLevel', 'tenant', 'createdAt'],
    description: 'Gestão centralizada de identidades e jornada de conversão do hóspede.',
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Aislamiento absoluto. La creación es pública (Handshake), 
   * pero la auditoría es exclusiva del Staff autenticado por Tenant.
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, // Acceso para formularios de aterrizaje
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer', // Solo Devs purgan identidades
  },

  /**
   * GUARDIANES DE IDENTIDAD (Forensic Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Sanitiza la identidad y garantiza el perímetro de propiedad.
     */
    beforeChange: [
      (async ({ req, data, operation }) => {
        const start = performance.now();
        const traceId = `crm_sync_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][CRM][START] Syncing Identity Node | ID: ${traceId}${C.reset}`);

        // 1. Inyección de Perímetro Multi-Tenant
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 2. Normalización de Identidad (Strict Lowercase)
        if (data.email) {
          data.email = data.email.toLowerCase().trim();
        }

        // 3. Timestamp de Actividad Inicial
        if (operation === 'create') {
          data.lastEngagementDate = new Date().toISOString();
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][CRM][END] Identity Sealed | Time: ${duration.toFixed(4)}ms${C.reset}`);
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Registra la conversión exitosa en el ledger de infraestructura.
     */
    afterChange: [
      (async ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`   ${C.cyan}→ [LEAD_CAPTURED]${C.reset} New identity in CRM: ${doc.email} | Source: ${doc.source}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Perfil de Identidade',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  unique: true,
                  index: true,
                  admin: { width: '60%', placeholder: 'hospede@exemplo.com' }
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'active',
                  required: true,
                  index: true,
                  options: [
                    { label: 'Ativo (Subscribed)', value: 'active' },
                    { label: 'Cancelado (Unsubscribed)', value: 'unsubscribed' },
                    { label: 'Inválido (Bounce)', value: 'bounced' },
                    { label: 'Em Quarentena', value: 'quarantine' }
                  ],
                  admin: { width: '40%' }
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'source',
                  type: 'text',
                  defaultValue: 'web-portal',
                  index: true,
                  admin: { 
                    width: '50%',
                    description: 'Canal de origen (Ej: hero-form, festival-landing).' 
                  }
                },
                {
                  name: 'engagementLevel',
                  type: 'select',
                  defaultValue: 'newbie',
                  options: [
                    { label: 'Novo Lead', value: 'newbie' },
                    { label: 'Engajado (Active)', value: 'engaged' },
                    { label: 'Fidelizado (Loyalist)', value: 'loyalist' }
                  ],
                  admin: { width: '50%' }
                }
              ]
            }
          ]
        },
        {
          label: 'Compliance & Consentimento',
          description: 'Rastreadores de conformidade legal LGPD / GDPR.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'consentMarketing',
                  type: 'checkbox',
                  defaultValue: true,
                  required: true,
                  admin: { width: '50%', description: 'Autorización para envíos promocionales.' }
                },
                {
                  name: 'consentAnalytics',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '50%', description: 'Autorización para tracking de comportamiento.' }
                }
              ]
            },
            {
              name: 'consentTimestamp',
              type: 'date',
              admin: { 
                readOnly: true,
                description: 'Carimbo de tiempo inmutable de la aceptación de términos.' 
              }
            }
          ]
        },
        {
          label: 'Performance & Telemetria',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'emailsSentCount',
                  type: 'number',
                  defaultValue: 0,
                  admin: { readOnly: true, width: '33%' }
                },
                {
                  name: 'openRate',
                  type: 'number',
                  defaultValue: 0,
                  admin: { readOnly: true, width: '33%' }
                },
                {
                  name: 'lastEngagementDate',
                  type: 'date',
                  admin: { readOnly: true, width: '34%' }
                }
              ]
            },
            {
              name: 'metaData',
              type: 'json',
              admin: { 
                description: 'Payload técnico capturado por Heimdall (IP, UserAgent, UTMs).' 
              }
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
                description: 'Propriedade proprietária desta identidade.'
              }
            },
            {
              name: 'unsubscribedAt',
              type: 'date',
              admin: { 
                position: 'sidebar',
                readOnly: true,
                condition: (data) => data.status === 'unsubscribed'
              }
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Subscribers CRM calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);