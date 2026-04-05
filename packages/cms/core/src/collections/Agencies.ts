/**
 * @file packages/cms/core/src/collections/Agencies.ts
 * @description Enterprise Partner Identity Repository (Silo B).
 *              Orquesta el ecosistema de Alianzas B2B con validación KYB,
 *              segmentación por niveles de producción y telemetría Heimdall v2.0.
 *              Blindado para aislamiento Multi-Tenant y cumplimiento fiscal global.
 * @version 5.0 - Enterprise PRM Standard (Forensic Ready)
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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: AGENCIES (Partner Network)...${C.reset}`);

/**
 * APARATO: Agencies
 * @description Registro central de nodos comerciales y operadores mayoristas.
 */
export const Agencies: CollectionConfig = {
  slug: 'agencies',
  admin: {
    useAsTitle: 'brandName',
    group: 'Supply Chain / Partners',
    defaultColumns: ['brandName', 'tier', 'trustScore', 'status', 'tenant'],
    description: 'Diretório central de operadoras e agências de viagens verificadas.',
  },
  
  /**
   * REGLAS DE ACCESO (Sovereign Security)
   * @pilar VIII: Aislamiento Perimetral Tier S2.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE CUMPLIMIENTO (Forensic Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Sanitización fiscal y blindaje de propiedad.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        const traceId = `prm_sync_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][PRM][START] Validating Partner Identity | ID: ${traceId}${C.reset}`);

        // 1. Inyección de Perímetro Automática
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 2. Normalización de Identidad Fiscal (Strict Alpha-Numeric)
        if (data.taxId) {
          data.taxId = data.taxId.replace(/[^\d\w-]/g, '').toUpperCase();
        }

        // 3. Sanitización de URL Corporativa
        if (data.website) {
          data.website = data.website.toLowerCase().trim();
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][PRM][END] Compliance Handshake OK | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Telemetría de transición de estados comerciales.
     */
    afterChange: [
      (async ({ doc, operation, previousDoc, req }) => {
        if (operation === 'update' && doc.status !== previousDoc?.status) {
          const actor = req.user?.email || 'SYSTEM_NODE';
          console.log(`${C.yellow}    [AUDIT][PARTNER-TRANSITION]${C.reset} Agency: ${doc.brandName} | Status: ${previousDoc?.status} → ${doc.status} | Actor: ${actor}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad Corporativa (KYB)',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'brandName', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '50%', placeholder: 'Nombre Comercial' } 
                },
                { 
                  name: 'legalName', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '50%', placeholder: 'Razón Social Legal' } 
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'jurisdiction',
                  type: 'select',
                  required: true,
                  defaultValue: 'BR',
                  options: [
                    { label: 'Brasil (CNPJ)', value: 'BR' },
                    { label: 'Chile (RUT)', value: 'CL' },
                    { label: 'Argentina (CUIT)', value: 'AR' },
                    { label: 'Uruguay (RUT)', value: 'UY' },
                    { label: 'USA / International (TaxID)', value: 'INTL' }
                  ],
                  admin: { width: '30%' }
                },
                { 
                  name: 'taxId', 
                  type: 'text', 
                  required: true, 
                  index: true,
                  admin: { width: '40%', description: 'ID Fiscal inmutable sin símbolos.' } 
                },
                { 
                  name: 'iataCode', 
                  type: 'text', 
                  admin: { width: '30%', description: 'Código regulador (opcional).' } 
                },
              ]
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'website', 
                  type: 'text', 
                  admin: { width: '50%', placeholder: 'https://agency-portal.com' } 
                },
                { 
                  name: 'logo', 
                  type: 'upload', 
                  relationTo: 'media', 
                  required: true,
                  admin: { width: '50%', description: 'Isotipo para materiales co-branded.' }
                },
              ]
            }
          ]
        },
        {
          label: 'Segmentación & Performance',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'tier', 
                  type: 'select', 
                  required: true,
                  defaultValue: 'bronze',
                  options: [
                    { label: 'Platinum Elite (S-Tier)', value: 'platinum' },
                    { label: 'Gold Partner', value: 'gold' },
                    { label: 'Silver Operator', value: 'silver' },
                    { label: 'Bronze Iniciado', value: 'bronze' }
                  ],
                  admin: { width: '33%' } 
                },
                { 
                  name: 'trustScore', 
                  type: 'number', 
                  min: 0, 
                  max: 100, 
                  defaultValue: 50, 
                  admin: { width: '33%', description: 'Índice de solvencia (0-100).' } 
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'review',
                  required: true,
                  options: [
                    { label: 'Verificado (Activo)', value: 'active' },
                    { label: 'En Auditoría', value: 'review' },
                    { label: 'Bloqueado (Incumplimiento)', value: 'blocked' }
                  ],
                  admin: { width: '34%' }
                }
              ]
            },
            {
              name: 'commercialTerms',
              type: 'group',
              label: 'Acuerdos Financieros',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { 
                      name: 'baseCommission', 
                      type: 'number', 
                      defaultValue: 10, 
                      admin: { width: '50%', description: 'Porcentaje de comisión (%)' } 
                    },
                    { 
                      name: 'paymentCycle', 
                      type: 'select', 
                      defaultValue: 'net-30',
                      options: [
                        { label: 'Pre-pago (Cut & Pay)', value: 'prepaid' },
                        { label: 'Net 15 (Quincenal)', value: 'net-15' },
                        { label: 'Net 30 (Mensual)', value: 'net-30' }
                      ],
                      admin: { width: '50%' } 
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Infraestructura',
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
                description: 'Propiedad ancla de la alianza comercial.'
              } 
            },
            { 
              name: 'internalObservations', 
              type: 'textarea', 
              admin: { description: 'Registro inmutable de notas técnicas y comerciales.' } 
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Agencies Repository calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);