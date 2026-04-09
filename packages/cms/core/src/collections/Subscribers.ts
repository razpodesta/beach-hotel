/**
 * @file packages/cms/core/src/collections/Subscribers.ts
 * @description Centro de Inteligencia de Leads y Ciclo de Vida del Huésped (CRM Hub).
 *              Orquesta la persistencia de identidades, gestión de consentimiento
 *              y métricas de engagement con aislamiento Multi-Tenant de Grado S0.
 *              Refactorizado: Automatización de Consentimiento LGPD, resolución ESM (.js),
 *              perfilado de identidad y convergencia reactiva con Silo D.
 * @version 4.0 - Compliance Hardened & Silo Convergence
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
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: SUBSCRIBERS (CRM Hub)...${C.reset}`);
}

/**
 * APARATO: Subscribers
 * @description Única fuente de verdad para la audiencia y leads del ecosistema.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Management',
    defaultColumns: ['email', 'status', 'engagementLevel', 'tenant', 'createdAt'],
    description: 'Gestão centralizada de identidades e jornada de conversão do hóspede.',
  },
  
  access: {
    read: multiTenantReadAccess,
    create: () => true, // Handshake público de captura
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @description Sanitiza identidad, gestiona cumplimiento LGPD y ancla perímetros.
     */
    beforeChange: [
      (async ({ req, data, operation, originalDoc }) => {
        const start = performance.now();
        const traceId = `crm_sync_${Date.now().toString(36).toUpperCase()}`;

        // 1. Handshake de Perímetro Multi-Tenant
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
        }

        // 2. Normalización de Identidad (Pilar III)
        if (data.email) {
          data.email = data.email.toLowerCase().trim();
        }

        // 3. Reactor de Consentimiento (Compliance Shield)
        // Si es nuevo o si alguno de los checks de consentimiento ha cambiado
        const hasConsentChanged = operation === 'create' || 
          data.consentMarketing !== originalDoc?.consentMarketing ||
          data.consentAnalytics !== originalDoc?.consentAnalytics;

        if (hasConsentChanged) {
          data.consentTimestamp = new Date().toISOString();
        }

        // 4. Timestamp de Actividad Inicial
        if (operation === 'create') {
          data.lastEngagementDate = new Date().toISOString();
        }

        const duration = (performance.now() - start).toFixed(4);
        if (process.env.NODE_ENV !== 'test') {
          console.log(`${C.cyan}    [HEIMDALL][CRM] Identity Sealed | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
        }
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Reporta la captura de leads y cualifica conversiones en Silo D.
     */
    afterChange: [
      (async ({ doc, operation, req }) => {
        if (operation !== 'create') return;

        if (process.env.NODE_ENV !== 'test') {
          console.log(`   ${C.green}→ [LEAD_CAPTURED]${C.reset} New node: ${doc.email} | Source: ${doc.source}`);
        }

        // Cualificación de Lead y Notificación a Staff
        if (doc.engagementLevel === 'loyalist') {
          try {
            await req.payload.create({
              collection: 'notifications',
              data: {
                subject: 'Lead de Alta Fidelidad Detectado',
                message: `El usuario ${doc.email} ha alcanzado el nivel LOYALIST.`,
                priority: 'high',
                category: 'ops',
                source: 'CRM_ENGINE',
                tenant: typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant,
                isRead: false,
              }
            });
          } catch {
            console.error(`${C.red}   ✕ [SILO_D_LINK_FAILED] Unable to alert high-value lead.${C.reset}`);
          }
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
                  name: 'name',
                  type: 'text',
                  admin: { 
                    width: '40%', 
                    placeholder: 'Nome de tratamento',
                    description: 'Utilizado para personalização no Marketing Cloud.' 
                  }
                },
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  unique: true,
                  index: true,
                  admin: { width: '60%', placeholder: 'hospede@exemplo.com' }
                },
              ]
            },
            {
              type: 'row',
              fields: [
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
                  admin: { width: '33%' }
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
                  admin: { width: '33%' }
                },
                {
                  name: 'source',
                  type: 'text',
                  defaultValue: 'web-portal',
                  index: true,
                  admin: { 
                    width: '34%',
                    description: 'Canal de origen (Ej: hero-form, Silo-C Ingest).' 
                  }
                },
              ]
            }
          ]
        },
        {
          label: 'Compliance & Consentimento',
          description: 'Gestão inalterável de conformidade legal LGPD.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'consentMarketing',
                  type: 'checkbox',
                  defaultValue: true,
                  required: true,
                  admin: { width: '50%', description: 'Autorização para comunicações.' }
                },
                {
                  name: 'consentAnalytics',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { width: '50%', description: 'Autorização para behavioral tracking.' }
                }
              ]
            },
            {
              name: 'consentTimestamp',
              type: 'date',
              admin: { 
                readOnly: true,
                description: 'Carimbo de tempo da última alteração de consentimento.' 
              }
            }
          ]
        },
        {
          label: 'Métricas de Cloud',
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
                  admin: { readOnly: true, width: '33%', description: 'Porcentagem de abertura.' }
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
                description: 'Payload técnico forense (Trace ID, IP, Client Context).' 
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
                description: 'Perímetro proprietário desta identidade.'
              }
            },
            {
              name: 'unsubscribedAt',
              type: 'date',
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                condition: (data) => data?.status === 'unsubscribed'
              }
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Subscribers Hub calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}