/**
 * @file packages/cms/core/src/collections/Subscribers.ts
 * @description Centro de Inteligencia de Leads y Ciclo de Vida del Huésped.
 *              Refactorizado: Optimización de índices, hooks resilientes y
 *              sincronización total con el motor de ingesta de Server Actions.
 * @version 2.0 - Index Optimized & Production Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import type { CollectionConfig, CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

/**
 * APARATO: Subscribers (The CRM Hub)
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Management',
    defaultColumns: ['email', 'status', 'engagementLevel', 'source', 'tenant'],
    description: 'Gestão centralizada de leads e identidades para fidelização boutique.',
  },
  
  /**
   * REGLAS DE ACCESO SOBERANO
   * @pilar VIII: Aislamiento Multi-Tenant.
   */
  access: {
    read: multiTenantReadAccess,
    // Permite la creación desde el formulario público de la web
    create: () => true, 
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   */
  hooks: {
    beforeChange: [
      (({ req, data, operation }) => {
        /**
         * @fix: Lógica de herencia de propiedad.
         * Si es una creación manual desde el Admin Panel, hereda el tenant del Admin.
         * Si viene de la Server Action, respeta el tenant ya inyectado.
         */
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = req.user.tenant;
        }
        return data;
      }) as CollectionBeforeChangeHook,
    ],
    afterChange: [
      (({ doc, operation }) => {
        if (operation === 'create') {
          /** @pilar IV: Protocolo Heimdall - Telemetría CRM */
          console.log(`[HEIMDALL][CRM] Identity Registered: ${doc.email} | Origin: ${doc.source}`);
        }
      }) as CollectionAfterChangeHook
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad y Propiedad',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  unique: true, // Blindaje contra duplicados a nivel DB
                  index: true,
                  admin: { width: '60%' }
                },
                {
                  name: 'tenant',
                  type: 'relationship',
                  relationTo: 'tenants',
                  required: true,
                  index: true,
                  admin: { 
                    width: '40%',
                    description: 'Propriedade vinculada a este lead.'
                  }
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
                  index: true,
                  options: [
                    { label: 'Ativo', value: 'active' },
                    { label: 'Cancelado', value: 'unsubscribed' },
                    { label: 'Inválido (Bounce)', value: 'bounced' }
                  ],
                  admin: { width: '50%' }
                },
                {
                  name: 'source',
                  type: 'text',
                  defaultValue: 'web-landing',
                  index: true,
                  admin: { 
                    description: 'Ponto de entrada (ej: hero-form, festival-takeover)',
                    width: '50%' 
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'Engagement & Comportamiento',
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
                  name: 'engagementLevel',
                  type: 'select',
                  defaultValue: 'newbie',
                  options: [
                    { label: 'Novo Lead', value: 'newbie' },
                    { label: 'Engajado', value: 'engaged' },
                    { label: 'Fidelizado', value: 'loyalist' }
                  ],
                  admin: { width: '34%' }
                }
              ]
            },
            {
              name: 'lastEngagementDate',
              type: 'date',
              admin: { readOnly: true }
            }
          ]
        },
        {
          label: 'Datos Técnicos (Forensic)',
          fields: [
            {
              name: 'unsubscribedAt',
              type: 'date',
              admin: { 
                condition: (data) => data.status === 'unsubscribed',
                description: 'Carimbo de tempo da solicitação de saída.'
              }
            },
            {
              name: 'metaData',
              type: 'json',
              admin: { 
                description: 'Payload de telemetria capturado pelo Protocolo Heimdall.' 
              }
            }
          ]
        }
      ]
    }
  ]
};