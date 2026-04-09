/**
 * @file packages/cms/core/src/collections/users/Users.ts
 * @description Identity Cluster y Reactor de Reputación Digital (Protocolo 33).
 *              Refactorizado: Resolución de TS2304 (Access Type), TS7031 (Implicit Any)
 *              y purga de imports huérfanos.
 *              Estándar: Heimdall v2.5 Forensic Logging & React 19 Pure.
 * @version 14.1 - Type-Safe Reactor & RBAC Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import { 
  type CollectionConfig, 
  type Access, 
  type Where, 
  type CollectionBeforeChangeHook 
} from 'payload';
import { calculateProgress } from '@metashark/protocol-33';

/** 
 * IMPORTACIONES DE PERÍMETRO SOBERANO
 * @pilar V: Adherencia Arquitectónica. Se utilizan extensiones .js para 
 * cumplimiento estricto de ESM en el núcleo del CMS.
 */
import { multiTenantReadAccess } from '../Access.js';
import { ROLES_CONFIG, type RoleConfig, } from './roles/config.js';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: USERS (Identity Reactor)...${C.reset}`);
}

// ============================================================================
// REGLAS DE ACCESO SOBERANAS (RBAC Core)
// ============================================================================

/**
 * @function updateAccess
 * @description Define la autoridad de edición. 
 * @pilar III: Seguridad de Tipos Absoluta.
 */
const updateAccess: Access = ({ req: { user } }): boolean | Where => {
  const start = performance.now();
 // const identity = user?.email || 'Anonymous';
  
  if (!user) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`       ${C.red}✕ [DENIED]${C.reset} Access logic evaluated in ${(performance.now() - start).toFixed(4)}ms`);
    }
    return false;
  }

  // Nivel S0/S1: Autoridad Total sobre el perímetro
  if (user.role === 'developer' || user.role === 'admin') {
    return true;
  }
  
  // Nivel S4: Aislamiento estricto (Self-only)
  return { id: { equals: user.id } };
};

/**
 * @function deleteAccess
 */
const deleteAccess: Access = ({ req: { user } }): boolean => {
  return user?.role === 'developer';
};

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Identity Hooks)
// ============================================================================

/**
 * HOOK: beforeChangeReactor
 * @description El "Cerebro" de la identidad. Asegura que el nivel siempre 
 *              corresponda a la XP acumulada y gestiona el aprovisionamiento.
 */
const beforeChangeReactor: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  const start = performance.now();
  const traceId = `usr_sync_${Date.now().toString(36).toUpperCase()}`;

  // 1. Handshake de Perímetro (Multi-Tenant Shield)
  if (operation === 'create' && req.user && !data.tenant) {
    data.tenant = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant;
  }

  // 2. REACTOR DE REPUTACIÓN (Math Sync)
  // Independientemente del origen, el CMS impone la lógica soberana del P33.
  const xp = Number(data.experiencePoints || 0);
  const { currentLevel } = calculateProgress(xp);
  
  if (data.level !== currentLevel) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${C.yellow}   → [P33_REACTOR] Level Correction Detected: ${data.level} -> ${currentLevel}${C.reset}`);
    }
    data.level = currentLevel;
  }

  // 3. SELLO DE GÉNESIS
  if (operation === 'create' && process.env.IS_SEEDING_MODE === 'true') {
    data._verified = true;
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][IDENTITY] Handshake OK | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
  }

  return data;
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
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', 
    },
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'level', 'tenant'],
    group: 'Identity & Access',
    description: 'Gestão de identidades soberanas e reactor de reputação P33.',
  },

  access: {
    read: multiTenantReadAccess,
    create: () => true, 
    update: updateAccess,
    delete: deleteAccess,
  },

  hooks: {
    beforeChange: [beforeChangeReactor],
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
                { 
                  name: 'name', 
                  type: 'text', 
                  required: true, 
                  admin: { 
                    width: '50%',
                    placeholder: 'Nome de exibição ou Razão Social' 
                  } 
                },
                { 
                  name: 'email', 
                  type: 'text', 
                  required: true, 
                  unique: true, 
                  admin: { width: '50%' } 
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'role',
                  type: 'select',
                  required: true,
                  defaultValue: 'guest',
                  saveToJWT: true,
                  options: ROLES_CONFIG.map((r: RoleConfig) => ({ label: r.label, value: r.value })),
                  admin: { width: '50%' },
                },
                {
                  name: 'tenant',
                  type: 'relationship',
                  relationTo: 'tenants',
                  required: true,
                  saveToJWT: true,
                  index: true,
                  admin: { 
                    width: '50%',
                    readOnly: true, 
                    description: 'Perímetro soberano de propriedade.'
                  },
                },
              ]
            }
          ],
        },
        {
          label: 'Protocolo 33 Reactor',
          description: 'Métricas de reputação digital. O nível é calculado automaticamente com base no XP.',
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
                    width: '30%',
                    description: 'Calculado pelo Math Engine.' 
                  } 
                },
                { 
                  name: 'experiencePoints', 
                  type: 'number', 
                  defaultValue: 0, 
                  required: true,
                  admin: { 
                    width: '70%',
                    description: 'Total de RazTokens (XP) acumulados.' 
                  } 
                },
              ],
            },
          ],
        },
        {
          label: 'B2B & Partners',
          fields: [
            {
              name: 'operatorMetadata',
              type: 'group',
              label: 'Configuração de Agente',
              admin: { condition: (data) => data?.role === 'operator' },
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
          ]
        },
        {
          label: 'Preferences',
          fields: [
            {
              name: 'guestMetadata',
              type: 'group',
              label: 'Contexto do Hóspede',
              fields: [
                { name: 'preferredLanguage', type: 'text', admin: { placeholder: 'pt-BR' } },
                { name: 'discoverySource', type: 'text', admin: { readOnly: true } },
              ]
            }
          ]
        }
      ],
    },
    { name: '_verified', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
  ],
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Users Collection calibrated | Time: ${collectionDuration.toFixed(4)}ms\n`);
}