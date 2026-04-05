/**
 * @file packages/cms/core/src/collections/Agents.ts
 * @description Registro Soberano de Agentes y Consultores B2B (Silo B).
 *              Rastrea la identidad profesional, movilidad entre agencias y 
 *              métricas de rendimiento individual.
 *              Refactorizado: Integración Multi-Tenant, historial laboral automatizado
 *              y telemetría Heimdall v2.0 para auditoría de movilidad.
 * @version 2.0 - Professional Mobility Standard (Heimdall Injected)
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
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: AGENTS (Professional Tracker)...${C.reset}`);

/**
 * APARATO: Agents
 * @description Centraliza el "currículum operativo" de los aliados del hotel.
 */
export const Agents: CollectionConfig = {
  slug: 'agents',
  admin: {
    useAsTitle: 'fullName',
    group: 'Supply Chain / Partners',
    defaultColumns: ['fullName', 'email', 'currentAgency', 'status', 'tenant'],
    description: 'Gestão de consultores individuais e seu histórico na Red de Alianzas.',
  },

  /**
   * REGLAS DE ACCESO (Aislamiento Perimetral)
   * @pilar VIII: Seguridad de Grado S2.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE INTEGRIDAD Y MOVILIDAD (Forensic Hooks)
   */
  hooks: {
    /**
     * HOOK: beforeChange
     * @description Orquesta el historial de empleo y garantiza la consistencia del Tenant.
     */
    beforeChange: [
      (async ({ data, operation, req, originalDoc }) => {
        const start = performance.now();
        const traceId = `agt_sync_${Date.now().toString(36)}`;
        
        console.log(`${C.blue}    [HEIMDALL][AGENT][START] Validating Agent mobility | ID: ${traceId}${C.reset}`);

        // 1. Inyección de Perímetro (Tenant Shield)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 2. Inteligencia de Historial Laboral
        // Si la agencia actual cambia, movemos la anterior al historial automáticamente.
        if (operation === 'update' && data.currentAgency !== originalDoc.currentAgency) {
          const historyEntry = {
            agency: originalDoc.currentAgency,
            startDate: originalDoc.createdAt,
            endDate: new Date().toISOString(),
            reasonForDeparture: 'Transferencia de Nodo / Cambio de Agencia'
          };
          
          data.employmentHistory = [
            ...(data.employmentHistory || []),
            historyEntry
          ];
          
          console.log(`       ${C.yellow}[MOBILITY_DETECTED]${C.reset} Agent moving from Agency ID: ${originalDoc.currentAgency}`);
        }

        const duration = performance.now() - start;
        console.log(`${C.green}    [HEIMDALL][AGENT][END] Identity Levelled | Time: ${duration.toFixed(4)}ms${C.reset}`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],

    /**
     * HOOK: afterChange
     * @description Reporta cambios en el estatus de auditoría del agente.
     */
    afterChange: [
      (async ({ doc, operation, previousDoc }) => {
        if (operation === 'update' && doc.status !== previousDoc?.status) {
          console.log(`${C.cyan}   → [AGENT_AUDIT]${C.reset} Consultant ${doc.fullName} status: ${previousDoc?.status} → ${doc.status}`);
        }
      }) as CollectionAfterChangeHook,
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Perfil del Agente',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'fullName', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '60%', placeholder: 'Nombre Completo del Consultor' } 
                },
                { 
                  name: 'status', 
                  type: 'select', 
                  defaultValue: 'active', 
                  required: true,
                  options: [
                    { label: 'Activo (Autorizado)', value: 'active' },
                    { label: 'Inactivo', value: 'inactive' },
                    { label: 'Bloqueado (Incumplimiento)', value: 'blacklisted' }
                  ], 
                  admin: { width: '40%' } 
                }
              ]
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'email', 
                  type: 'email', 
                  required: true, 
                  unique: true, 
                  index: true,
                  admin: { width: '50%' } 
                },
                { 
                  name: 'phone', 
                  type: 'text', 
                  admin: { width: '50%', placeholder: '+56 9 ...' } 
                }
              ]
            },
            {
              name: 'currentAgency',
              type: 'relationship',
              relationTo: 'agencies',
              required: true,
              index: true,
              admin: { 
                description: 'Vínculo activo con el nodo mayorista o minorista.' 
              }
            }
          ]
        },
        {
          label: 'Pedigrí Profesional',
          fields: [
            {
              name: 'employmentHistory',
              type: 'array',
              label: 'Trayectoria en la Red',
              labels: { singular: 'Vinculación Anterior', plural: 'Log de Movilidad' },
              admin: { 
                description: 'Registro inmutable de agencias donde el consultor ha operado anteriormente.' 
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'agency', type: 'relationship', relationTo: 'agencies', required: true, admin: { width: '50%' } },
                    { name: 'reasonForDeparture', type: 'text', admin: { width: '50%' } }
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'startDate', type: 'date', required: true, admin: { width: '50%' } },
                    { name: 'endDate', type: 'date', admin: { width: '50%' } }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Métricas & Conversión',
          fields: [
            {
              name: 'performanceMetrics',
              type: 'group',
              label: 'Indicadores de Éxito',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { 
                      name: 'dealsClosed', 
                      type: 'number', 
                      defaultValue: 0, 
                      admin: { width: '33%', readOnly: true, description: 'Reservas confirmadas.' } 
                    },
                    { 
                      name: 'dealsFailed', 
                      type: 'number', 
                      defaultValue: 0, 
                      admin: { width: '33%', readOnly: true, description: 'Cancelaciones / No-Shows.' } 
                    },
                    { 
                      name: 'totalRevenueGenerated', 
                      type: 'number', 
                      defaultValue: 0, 
                      admin: { width: '34%', readOnly: true, description: 'Valor neto aportado al hotel.' } 
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
                description: 'Perímetro propietario de este registro de agente.'
              } 
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Agents Tracker calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);