/**
 * @file packages/cms/core/src/collections/Tenants.ts
 * @description Orquestador Soberano de Perímetros Multi-Tenant.
 *              Evolucionado para gestionar la Identidad Cromática (OKLCH) y 
 *              Configuración de Atmósfera, eliminando el hardcoding en el Frontend.
 *              Inyecta Protocolo Heimdall para auditoría de performance.
 * @version 4.0 - Sovereign Identity & Atmosphere Orchestrator
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig, type CollectionBeforeChangeHook } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

/**
 * APARATO: Tenants
 * @description Define la frontera física, digital y estética de cada propiedad.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Infrastructure',
    description: 'Gestión centralizada de identidades de propiedad y configuraciones de marca.',
    defaultColumns: ['name', 'slug', 'domain', 'status'],
  },

  /**
   * REGLAS DE ACCESO PERIMETRAL
   * @pilar VIII: Resiliencia y Seguridad Tier S0.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'developer',
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'developer',
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Heimdall Hooks)
   */
  hooks: {
    beforeChange: [
      (async ({ data, operation }) => {
        const start = performance.now();
        const traceId = `tenant_sync_${Date.now().toString(36)}`;
        
        console.log(`${C.magenta}  [HEIMDALL][PERIMETER][START] Syncing Tenant Identity | ID: ${traceId}${C.reset}`);

        // 1. Automatización de Identificador Semántico
        if (data.name && typeof data.name === 'string' && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        // 2. Normalización de Dominio (Protocol Shield)
        if (data.domain && typeof data.domain === 'string') {
          data.domain = data.domain.replace(/\/$/, '').toLowerCase();
        }

        const duration = performance.now() - start;
        console.log(`     ${C.green}✓ [OK]${C.reset} Identity SSSoT updated | Op: ${operation} | Time: ${duration.toFixed(4)}ms`);
        
        return data;
      }) as CollectionBeforeChangeHook,
    ],
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad de Perímetro',
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
                    placeholder: 'Ej: Beach Hotel Canasvieiras' 
                  },
                },
                {
                  name: 'slug',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  admin: { 
                    width: '50%',
                    description: 'Identificador inmutable para rumbos de API.' 
                  },
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
                description: 'Dominio DNS autorizado para el Handshake del Middleware.',
              },
            },
            {
              name: 'status',
              type: 'select',
              defaultValue: 'active',
              required: true,
              options: [
                { label: 'Operativo (Online)', value: 'active' },
                { label: 'Mantenimiento (Static Fallback)', value: 'maintenance' },
                { label: 'Suspendido (Vault Locked)', value: 'suspended' },
              ],
              admin: { position: 'sidebar' }
            }
          ],
        },
        {
          label: 'Atmósfera & Branding',
          description: 'Configuración cromática soberana basada en el espacio OKLCH.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  required: true,
                  defaultValue: 'oklch(65% 0.25 270)',
                  admin: { 
                    width: '50%',
                    description: 'Token Primary para el Oxygen Engine.' 
                  },
                },
                {
                  name: 'accentColor',
                  type: 'text',
                  required: true,
                  defaultValue: 'oklch(70% 0.15 320)',
                  admin: { 
                    width: '50%',
                    description: 'Token Accent para micro-interacciones.' 
                  },
                },
              ],
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Isotipo oficial para el Header y Facturación.' },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Icono de pestaña (32x32px optimized).' },
            }
          ],
        },
        {
          label: 'Protocolo 33 Settings',
          fields: [
            {
              name: 'enableGamification',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Activa la recolección de artefactos en esta propiedad.' }
            },
            {
              name: 'baseExperienceMultiplier',
              type: 'number',
              defaultValue: 1,
              admin: { 
                description: 'Multiplicador de XP para eventos especiales en este Tenant.' 
              }
            }
          ]
        }
      ],
    },
  ],
};