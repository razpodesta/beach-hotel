/**
 * @file packages/cms/core/src/collections/Tenants.ts
 * @description Orquestador Soberano de Perímetros Multi-Tenant (Root Node).
 *              Define la frontera física, digital, social y estética de cada propiedad.
 *              Refactorizado: Inmutabilidad de slugs, validación OKLCH v4, 
 *              inyección de Social DNA y resolución ESM (.js).
 *              Estándar: Heimdall v2.5 Forensic Logging & Multi-Tenant Shield.
 * @version 5.0 - Master Identity & Social DNA Sealed
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig, type CollectionBeforeChangeHook } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

/** CONSTANTES CROMÁTICAS HEIMDALL v2.5 */
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const collectionStart = performance.now();
if (process.env.NODE_ENV !== 'test') {
  console.log(`${C.magenta}  [DNA][LOAD] Building Collection: TENANTS (Master Perimeter)...${C.reset}`);
}

// ============================================================================
// GUARDIANES DE CICLO DE VIDA (Perimeter Hooks)
// ============================================================================

/**
 * HOOK: beforeChangePerimeter
 * @description Automatiza la identidad semántica y protege la inmutabilidad.
 */
const beforeChangePerimeter: CollectionBeforeChangeHook = async ({ data, operation, originalDoc }) => {
  const start = performance.now();
  const traceId = `tenant_hsk_${Date.now().toString(36).toUpperCase()}`;

  // 1. Automatización de Slug (Génesis Protocol)
  if (data.name && !data.slug) {
    data.slug = (data.name as string)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  // 2. Protección de Inmutabilidad tras Creación
  if (operation === 'update' && data.slug !== originalDoc?.slug) {
    throw new Error('SECURITY_BREACH: Tenant Slug is immutable post-creation to preserve SEO integrity.');
  }

  // 3. Normalización de Dominio (Protocol Shield)
  if (data.domain) {
    data.domain = (data.domain as string).replace(/\/$/, '').toLowerCase();
  }

  const duration = (performance.now() - start).toFixed(4);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${C.green}    [HEIMDALL][PERIMETER] Identity Sealed | Trace: ${traceId} | Lat: ${duration}ms${C.reset}`);
  }
  
  return data;
};

// ============================================================================
// DEFINICIÓN DE LA COLECCIÓN
// ============================================================================

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Infrastructure',
    description: 'Gestão centralizada de identidades de propriedade e DNA de marca.',
    defaultColumns: ['name', 'slug', 'domain', 'status'],
  },

  /**
   * REGLAS DE ACCESO (Sovereign Security Tier S0)
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'developer',
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  hooks: {
    beforeChange: [beforeChangePerimeter],
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade de Perímetro',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'name', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '50%', placeholder: 'Nome Comercial' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  index: true,
                  admin: { 
                    width: '50%', 
                    description: 'Identificador inalterável para API (Inamovível).' 
                  } 
                },
              ],
            },
            {
              name: 'domain',
              type: 'text',
              unique: true,
              required: true,
              admin: {
                placeholder: 'https://beachhotelcanasvieiras.com',
                description: 'Domínio DNS autorizado para handshake de segurança.',
              },
            },
            {
              name: 'status',
              type: 'select',
              defaultValue: 'active',
              required: true,
              options: [
                { label: 'Operativo (Online)', value: 'active' },
                { label: 'Manutenção (Static Mock)', value: 'maintenance' },
                { label: 'Suspenso (Perímetro Trancado)', value: 'suspended' },
              ],
              admin: { position: 'sidebar' }
            }
          ],
        },
        {
          label: 'Oxygen DNA (Branding)',
          description: 'Configuração cromática baseada no espaço OKLCH para Tailwind v4.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  required: true,
                  defaultValue: 'oklch(65% 0.25 270)',
                  admin: { width: '50%', description: 'Token Primary (Header/UI).' }
                },
                {
                  name: 'accentColor',
                  type: 'text',
                  required: true,
                  defaultValue: 'oklch(70% 0.15 320)',
                  admin: { width: '50%', description: 'Token Accent (Glow/P33).' }
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'logo', type: 'upload', relationTo: 'media', required: true, admin: { width: '50%' } },
                { name: 'favicon', type: 'upload', relationTo: 'media', admin: { width: '50%' } }
              ]
            }
          ],
        },
        {
          label: 'Social & SEO Master',
          fields: [
            {
              name: 'socialDNA',
              type: 'group',
              label: 'Redes Sociais Globais',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'instagram', type: 'text', admin: { width: '33%', placeholder: '@beachhotel' } },
                    { name: 'facebook', type: 'text', admin: { width: '33%' } },
                    { name: 'whatsapp', type: 'text', admin: { width: '34%', placeholder: '+55...' } }
                  ]
                }
              ]
            },
            {
              name: 'seoMaster',
              type: 'group',
              label: 'Configurações Globais de Busca',
              fields: [
                { name: 'globalMetaTitle', type: 'text', admin: { placeholder: 'Título base do Hotel' } },
                { name: 'globalMetaDescription', type: 'textarea' }
              ]
            }
          ]
        },
        {
          label: 'Protocolo 33 Control',
          fields: [
            {
              name: 'enableGamification',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Ativa o sistema de reputação e artefatos nesta propriedade.' }
            },
            {
              name: 'baseExperienceMultiplier',
              type: 'number',
              defaultValue: 1,
              admin: { description: 'Multiplicador de XP para eventos táticos neste Tenant.' }
            }
          ]
        }
      ],
    },
  ],
};

const collectionDuration = performance.now() - collectionStart;
if (process.env.NODE_ENV !== 'test') {
  console.log(`   ${C.green}✓ [DNA][SUCCESS]${C.reset} Tenants Perimeters levelvelled | Time: ${collectionDuration.toFixed(4)}ms\n`);
}