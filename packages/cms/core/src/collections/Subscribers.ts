/**
 * @file packages/cms/core/src/collections/Subscribers.ts
 * @description Centro de Inteligencia de Leads y Ciclo de Vida del Huésped.
 *              Implementa rastreo de comportamiento, métricas de engagement 
 *              y cumplimiento de soberanía de datos Multi-Tenant.
 * @version 1.0 - Next-Gen CRM Architecture
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Management',
    defaultColumns: ['email', 'status', 'engagementLevel', 'tenant'],
    description: 'Bóveda de identidades captadas para marketing y fidelización.',
  },
  
  /**
   * REGLAS DE ACCESO SOBERANO
   * LECTURA/ESCRITURA: Restringida por jerarquía de Tenant (Privacidad Total).
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, // Permite ingesta desde Server Actions públicas
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          if (!data.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`[HEIMDALL][CRM] New Identity Linked: ${doc.email} | Origin: ${doc.source}`);
        }
      }
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
                  index: true,
                  admin: { width: '60%' }
                },
                {
                  name: 'tenant',
                  type: 'relationship',
                  relationTo: 'tenants',
                  required: true,
                  admin: { width: '40%' }
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
                  options: [
                    { label: 'Activo', value: 'active' },
                    { label: 'Darse de baja', value: 'unsubscribed' },
                    { label: 'Rebotado', value: 'bounced' }
                  ],
                  admin: { width: '50%' }
                },
                {
                  name: 'source',
                  type: 'text',
                  defaultValue: 'web-landing',
                  admin: { 
                    description: 'Punto de entrada (ej: landing-hero, festival-popup)',
                    width: '50%' 
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'Métricas de Comportamiento',
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
                  admin: { readOnly: true, width: '33%', description: 'Porcentaje de apertura' }
                },
                {
                  name: 'engagementLevel',
                  type: 'select',
                  defaultValue: 'newbie',
                  options: [
                    { label: 'Nuevo', value: 'newbie' },
                    { label: 'Interesado', value: 'engaged' },
                    { label: 'Fanático', value: 'loyalist' }
                  ],
                  admin: { width: '34%' }
                }
              ]
            },
            {
              name: 'lastEngagementDate',
              type: 'date',
              admin: { readOnly: true, description: 'Última vez que abrió un correo' }
            }
          ]
        },
        {
          label: 'Historial Técnico',
          fields: [
            {
              name: 'unsubscribedAt',
              type: 'date',
              admin: { 
                condition: (data) => data.status === 'unsubscribed',
                description: 'Fecha en la que solicitó el retiro de sus datos.'
              }
            },
            {
              name: 'metaData',
              type: 'json',
              admin: { description: 'Payload técnico (I.P., UserAgent, Idioma del Navegador)' }
            }
          ]
        }
      ]
    }
  ]
};