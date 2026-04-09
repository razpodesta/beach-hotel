/**
 * @file packages/cms/core/src/collections/Agents.ts
 * @description Registro Soberano de Agentes y Consultores B2B (Silo B).
 *              Rastrea la identidad profesional, movilidad y performance.
 *              Refactorizado: Resolución ESM (.js), robustez en historial laboral,
 *              convergencia con Silo D y telemetría Heimdall v2.5.
 *              Estándar: Professional Mobility & Security Audit.
 * @version 2.1 - ESM Resolution & Forensic Mobility Guard
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
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: AGENTS (Professional Tracker)...${C.reset}`);
}

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Mobility Hooks)
// ============================================================================

/**
 * HOOK: beforeChangeMobility
 * @description Gestiona el historial de empleo inmutable y ancla perímetros.
 */
const beforeChangeMobility: CollectionBeforeChangeHook = async ({ data, operation, req, originalDoc }) => {
  const start = performance.now();
  const traceId = `agt_sync_${Date.now().toString(36).toUpperCase()}`;

  // 1. Handshake de Perímetro Multi-Tenant
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
  }

  // 2. Inteligencia de Movilidad Profesional (Pilar VIII)
  if (operation === 'update' && originalDoc) {
    const prevAgencyId = typeof originalDoc.currentAgency === 'object' ? originalDoc.currentAgency?.id : originalDoc.currentAgency;
    const nextAgencyId = typeof data.currentAgency === 'object' ? data.currentAgency?.id : data.currentAgency;

    if (prevAgencyId && nextAgencyId && prevAgencyId !== nextAgencyId) {
      const historyEntry = {
        agency: prevAgencyId,
        startDate: originalDoc.createdAt,
        endDate: new Date().toISOString(),
        reasonForDeparture: 'Transferência de Nó / Mobilidade Corporativa'
      };
      
      data.employmentHistory = [
        ...(data.employmentHistory || []),
        historyEntry
      ];
      
      if (process.env.NODE_ENV !== 'test') {
        console.log(`${C.yellow}       [MOBILITY_DETECTED] Agent ${data.fullName} moved from ${prevAgencyId}${C.reset}`);
      }
    }
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][AGENT] Mobility Handshake OK | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
  }
  
  return data;
};

/**
 * HOOK: afterChangeSecurity
 * @description Reporta anomalías o bloqueos de agentes al Silo D.
 */
const afterChangeSecurity: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  if (operation === 'update' && doc.status !== previousDoc?.status) {
    if (doc.status === 'blacklisted') {
      const actor = req.user?.email || 'SYSTEM_CORE';
      
      try {
        await req.payload.create({
          collection: 'notifications',
          data: {
            subject: 'ALERTA: Agente Bloqueado (Blacklist)',
            message: `O consultor ${doc.fullName} (${doc.email}) foi banido da rede por ${actor}.`,
            priority: 'critical',
            category: 'security',
            source: 'AGENT_TRACKER',
            tenant: typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant,
            isRead: false,
          }
        });
      } catch {
        console.error(`${C.red}   ✕ [SILO_D_LINK_FAILED] Unable to log agent security alert.${C.reset}`);
      }
    }
  }
};

// ============================================================================
// DEFINICIÓN DE LA COLECCIÓN
// ============================================================================

export const Agents: CollectionConfig = {
  slug: 'agents',
  admin: {
    useAsTitle: 'fullName',
    group: 'Supply Chain / Partners',
    defaultColumns: ['fullName', 'email', 'currentAgency', 'status', 'tenant'],
    description: 'Gestão de consultores individuais e seu histórico na Red de Alianzas.',
  },

  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user && (user.role === 'admin' || user.role === 'developer'),
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    beforeChange: [beforeChangeMobility],
    afterChange: [afterChangeSecurity],
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Perfil Profissional',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'fullName', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '60%' } 
                },
                { 
                  name: 'status', 
                  type: 'select', 
                  defaultValue: 'active', 
                  required: true,
                  options: [
                    { label: 'Ativo (Autorizado)', value: 'active' },
                    { label: 'Inativo', value: 'inactive' },
                    { label: 'Bloqueado (Blacklist)', value: 'blacklisted' }
                  ], 
                  admin: { width: '40%' } 
                }
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', required: true, unique: true, index: true, admin: { width: '50%' } },
                { name: 'phone', type: 'text', admin: { width: '50%' } }
              ]
            },
            {
              name: 'currentAgency',
              type: 'relationship',
              relationTo: 'agencies',
              required: true,
              index: true,
              admin: { description: 'Vinculação ativa no ecossistema B2B.' }
            }
          ]
        },
        {
          label: 'Histórico de Mobilidade',
          fields: [
            {
              name: 'employmentHistory',
              type: 'array',
              label: 'Trajetória Profissional',
              labels: { singular: 'Nó Anterior', plural: 'Log de Mobilidade' },
              admin: { readOnly: true },
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
                    { name: 'startDate', type: 'date', admin: { width: '50%' } },
                    { name: 'endDate', type: 'date', admin: { width: '50%' } }
                  ]
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
            {
              name: 'performanceMetrics',
              type: 'group',
              label: 'Indicadores de Conversão',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'dealsClosed', type: 'number', defaultValue: 0, admin: { width: '50%', readOnly: true } },
                    { name: 'totalRevenueGenerated', type: 'number', defaultValue: 0, admin: { width: '50%', readOnly: true } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Agents Tracker calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}