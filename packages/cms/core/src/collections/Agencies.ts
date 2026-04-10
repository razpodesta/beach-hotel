/**
 * @file packages/cms/core/src/collections/Agencies.ts
 * @description Enterprise Partner Identity Repository (Silo B).
 *              Orquesta el ecosistema de Alianzas B2B con validación KYB,
 *              agregadores financieros y telemetría Heimdall v2.5.
 *              Refactorizado: Resolución de TS2307 (Path Fix), purga de linter
 *              mediante Optional Catch Binding y validación de integridad fiscal.
 *              Estándar: Multi-Tenant Shield & Forensic Auditing.
 * @version 6.2 - Path Sealed & Linter Pure
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type CollectionBeforeChangeHook, 
  type CollectionAfterChangeHook 
} from 'payload';

/** 
 * IMPORTACIONES DE PERÍMETRO SOBERANO
 * @pilar V: Adherencia Arquitectónica. 
 * @fix TS2307: Ruta corregida a nivel local (./) para resolución exitosa en el grafo.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: AGENCIES (Partner Network)...${C.reset}`);
}

/**
 * APARATO: Agencies
 * @description Registro central de nodos comerciales y operadores mayoristas.
 */
export const Agencies: CollectionConfig = {
  slug: 'agencies',
  admin: {
    useAsTitle: 'brandName',
    group: 'Supply Chain / Partners',
    defaultColumns: ['brandName', 'tier', 'trustScore', 'status', 'totalYield'],
    description: 'Diretório central de operadoras e agências de viagens verificadas.',
  },
  
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @description Sanitización fiscal y blindaje de propiedad Multi-Tenant.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        const traceId = `prm_dna_${Date.now().toString(36).toUpperCase()}`;
        
        // 1. Handshake de Perímetro (Tenant Guard)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
        }

        // 2. Normalización Fiscal (Pilar III)
        if (data.taxId) {
          data.taxId = (data.taxId as string).replace(/[^\d\w-]/g, '').toUpperCase();
        }

        const duration = performance.now() - start;
        if (process.env.NODE_ENV !== 'test') {
          console.log(`${C.cyan}    [HEIMDALL][PRM] Handshake OK | Trace: ${traceId} | Lat: ${duration.toFixed(4)}ms${C.reset}`);
        }
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Orquesta la sincronización con el Silo D (Notifications) ante cambios de auditoría.
     */
    afterChange: [
      (async ({ doc, operation, previousDoc, req }) => {
        if (operation === 'update' && doc.status !== previousDoc?.status) {
          const actor = req.user?.email || 'SYSTEM_CORE';
          
          try {
            await req.payload.create({
              collection: 'notifications',
              data: {
                subject: `Estatus de Agencia Actualizado: ${doc.brandName}`,
                message: `El nodo ${doc.brandName} ha sido marcado como ${doc.status.toUpperCase()} por ${actor}.`,
                priority: doc.status === 'blocked' ? 'critical' : 'high',
                category: 'security',
                source: 'PRM_CORE',
                tenant: typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant,
                isRead: false,
              }
            });
          } catch {
            /** 
             * @fix ESLint: Optional Catch Binding implemented.
             * @pilar VIII: Resiliencia - El fallo en el log no debe abortar la mutación.
             */
            console.error(`${C.red}   ✕ [SILO_D_LINK_FAILED] Unable to log agency status change.${C.reset}`);
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
          label: 'Identidade Corporativa',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'brandName', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'legalName', type: 'text', required: true, admin: { width: '50%' } },
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
                    { label: 'USA / INTL (TaxID)', value: 'INTL' }
                  ],
                  admin: { width: '30%' }
                },
                { 
                  name: 'taxId', 
                  type: 'text', 
                  required: true, 
                  index: true, 
                  admin: { width: '40%' },
                  validate: (val: string | null | undefined) => {
                    if (val && val.length >= 5) return true;
                    return 'Identificador fiscal inválido o muy corto para auditoría.';
                  }
                },
                { name: 'iataCode', type: 'text', admin: { width: '30%' } },
              ]
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Isotipo para co-branding y flyers.' }
            }
          ]
        },
        {
          label: 'Performance & BI',
          description: 'Métricas de rendimento financeiro acumulado e confiança na rede.',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'totalYield', 
                  type: 'number', 
                  defaultValue: 0, 
                  admin: { 
                    width: '33%', 
                    readOnly: true,
                    description: 'Valor total de reservas geradas (R$).'
                  } 
                },
                { 
                  name: 'pendingCommission', 
                  type: 'number', 
                  defaultValue: 0, 
                  admin: { 
                    width: '33%', 
                    readOnly: true,
                    description: 'Comissões devengadas pendentes de pagamento.'
                  } 
                },
                { 
                  name: 'trustScore', 
                  type: 'number', 
                  min: 0, 
                  max: 100, 
                  defaultValue: 50, 
                  admin: { width: '34%', description: 'Índice de credibilidade (0-100).' } 
                },
              ]
            },
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
                  admin: { width: '50%' } 
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
                  admin: { width: '50%' }
                }
              ]
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
              admin: { position: 'sidebar', readOnly: true } 
            },
            { name: 'internalObservations', type: 'textarea', admin: { description: 'Registro inalterável de notas técnicas.' } }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Agencies Registry leveled | Time: ${collectionDuration.toFixed(4)}ms\n`);
}