/**
 * @file packages/cms/core/src/collections/users/Users.ts
 * @description Identity Cluster con Instrumentación Forense DNA-Level.
 *              Orquesta Auth, RBAC y el motor de reputación Protocolo 33.
 *              Nivelado: Nueva jerarquía de carpetas, imports relativos ajustados,
 *              y blindaje de campos de reputación (ReadOnly Authority).
 * @version 13.0 - Identity Domain Atomization (Heimdall Injected)
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig, type Access, type Where } from 'payload';

/** 
 * NIVELACIÓN DE IMPORTS 
 * @pilar V: Adherencia arquitectónica tras reubicación de archivo.
 */
import { multiTenantReadAccess } from '../Access';
import { ROLES_CONFIG } from './roles/config';

/**
 * CONSTANTES DE TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  blue: '\x1b[34m'
};

const collectionStart = performance.now();
console.log(`${C.magenta}  [DNA][LOAD] Building Collection: USERS (Identity Cluster)...${C.reset}`);

// ============================================================================
// REGLAS DE ACCESO SOBERANAS (RBAC Core)
// ============================================================================

/**
 * LOGIC: updateAccess
 * @fix TS2322: Garantía de tipo Access para el motor de Payload 3.0.
 */
const updateAccess: Access = (args) => {
  const start = performance.now();
  const identity = args.req.user?.email || 'Anonymous';
  console.log(`${C.cyan}    [HEIMDALL][ACCESS][START] Users.update | User: ${identity}${C.reset}`);
  
  const { req: { user } } = args;

  if (!user) {
    console.log(`       ${C.red}✕ [DENIED]${C.reset} Access logic evaluated in ${(performance.now() - start).toFixed(4)}ms`);
    return false;
  }

  // Bypass para rangos superiores
  if (user.role === 'developer' || user.role === 'admin') {
    console.log(`       ${C.green}✓ [GRANTED]${C.reset} Master Access | Time: ${(performance.now() - start).toFixed(4)}ms`);
    return true;
  }
  
  // Aislamiento: El usuario solo puede editarse a sí mismo
  const constraint: Where = { id: { equals: user.id } };
  console.log(`       ${C.green}✓ [RESTRICTED]${C.reset} Self-only visibility | Time: ${(performance.now() - start).toFixed(4)}ms`);
  return constraint;
};

/**
 * LOGIC: deleteAccess
 */
const deleteAccess: Access = (args) => {
  const start = performance.now();
  const isAuthorized = args.req.user?.role === 'developer';
  
  console.log(`${C.cyan}    [HEIMDALL][ACCESS][START] Users.delete | Auth: ${isAuthorized}${C.reset}`);
  console.log(`       ${isAuthorized ? C.green : C.red}✓ [FINISH]${C.reset} Evaluation completed in ${(performance.now() - start).toFixed(4)}ms`);
  
  return isAuthorized;
};

// ============================================================================
// DEFINICIÓN DE LA COLECCIÓN
// ============================================================================

export const Users: CollectionConfig = {
  slug: 'users',
  
  auth: {
    tokenExpiration: 7200, // 2 Horas
    verify: process.env.IS_SEEDING_MODE !== 'true',
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 min
    useAPIKey: true,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', 
    },
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'level', 'tenant'],
    group: 'Identity & Access',
    description: 'Gestão de identidades soberanas e reputação digital.',
  },

  access: {
    read: multiTenantReadAccess,
    create: () => true, 
    update: updateAccess,
    delete: deleteAccess,
  },

  hooks: {
    /**
     * HOOK: beforeChange
     * @description Orquesta la herencia de tenant y el bypass de seeding.
     */
    beforeChange: [
      (async ({ data, operation, req }) => {
        const start = performance.now();
        const traceId = `usr_dna_${Date.now().toString(36)}`;
        console.log(`${C.blue}    [HEIMDALL][HOOK][START] Users.beforeChange | ID: ${traceId}${C.reset}`);

        if (operation === 'create') {
          // 1. Handshake de Propiedad (Multi-Tenant Shield)
          if (req.user && !data.tenant) {
            data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
              ? req.user.tenant.id 
              : req.user.tenant;
            console.log(`       [INFO] Identity auto-anchored to Tenant: ${data.tenant}`);
          }
          
          // 2. Genesis Engine Bypass
          if (process.env.IS_SEEDING_MODE === 'true') {
            data._verified = true;
            console.log(`       [INFO] Genesis Protocol: Force verification active.`);
          }
        }

        console.log(`${C.green}    [HEIMDALL][HOOK][END] Identity calibrated | Time: ${(performance.now() - start).toFixed(4)}ms${C.reset}`);
        return data;
      }),
    ],
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Core Identity',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'text', required: true, unique: true, admin: { width: '50%' } },
                {
                  name: 'role',
                  type: 'select',
                  required: true,
                  defaultValue: 'guest',
                  saveToJWT: true,
                  options: ROLES_CONFIG.map(r => ({ label: r.label, value: r.value })),
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'tenant',
              type: 'relationship',
              relationTo: 'tenants',
              required: true,
              saveToJWT: true,
              index: true,
              admin: { 
                position: 'sidebar',
                readOnly: true, 
                description: 'Perímetro soberano de propriedade.'
              },
            },
          ],
        },
        {
          label: 'Metadata & PRM',
          fields: [
            {
              name: 'operatorMetadata',
              type: 'group',
              label: 'Configuração B2B (Agente)',
              admin: { condition: (data) => data.role === 'operator' },
              fields: [
                { name: 'agency', type: 'relationship', relationTo: 'agencies', required: true },
                { 
                  name: 'accessLevel', 
                  type: 'select', 
                  defaultValue: 'consultant',
                  options: [
                    { label: 'Agency Manager', value: 'manager' },
                    { label: 'Booking Consultant', value: 'consultant' }
                  ]
                },
              ]
            },
            {
              name: 'guestMetadata',
              type: 'group',
              label: 'Preferências do Hóspede',
              admin: { condition: (data) => ['guest', 'sponsor'].includes(data.role) },
              fields: [
                { name: 'loyaltyPoints', type: 'number', defaultValue: 0 },
                { name: 'preferredLanguage', type: 'text', admin: { placeholder: 'pt-BR' } },
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33 Intelligence',
          description: 'Métricas de reputação digital e nível de ascensão (ReadOnly).',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'level', 
                  type: 'number', 
                  defaultValue: 1, 
                  admin: { 
                    readOnly: true, 
                    width: '50%',
                    description: 'Nível atual. Atualizado automaticamente pelo BI Ledger.' 
                  } 
                },
                { 
                  name: 'experiencePoints', 
                  type: 'number', 
                  defaultValue: 0, 
                  admin: { 
                    readOnly: true, 
                    width: '50%',
                    description: 'Total de XP acumulado (RazTokens).' 
                  } 
                },
              ],
            },
          ],
        },
      ],
    },
    { name: '_verified', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
  ],
};

const collectionDuration = performance.now() - collectionStart;
console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Users Collection calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);