/**
 * @file packages/cms/core/src/collections/Notifications.ts
 * @description Enterprise Notification Ledger (Silo D Core).
 *              Orquesta la persistencia de señales operativas, alertas de sistema
 *              y mensajería entre nodos. Implementa el Protocolo de Auto-Purge
 *              basado en criticidad para asegurar la eficiencia del clúster.
 * @version 1.0 - Enterprise Level 4.0 | Auto-Purge Active
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'subject',
    group: 'Infrastructure', // Silo D alignment
    defaultColumns: ['subject', 'priority', 'source', 'isRead', 'tenant', 'createdAt'],
    description: 'Registro forense de eventos y comunicaciones internas del ecosistema.',
  },

  /**
   * REGLAS DE ACCESO (RBAC Tier S0-S1)
   */
  access: {
    read: multiTenantReadAccess,
    create: () => true, // Permitir despacho desde Server Actions
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * PROTOCOLO DE HIGIENE (Auto-Purge Engine)
   * @pilar VIII: Resiliencia y Eficiencia.
   */
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          // 1. Cálculo de Expiración Automática (Retention Policy)
          const now = new Date();
          let retentionDays = 30; // Default: Low priority

          if (data.priority === 'high') retentionDays = 90;
          if (data.priority === 'critical') retentionDays = 365 * 5; // Retención legal (5 años)

          const expiresAt = new Date(now.getTime() + (retentionDays * 24 * 60 * 60 * 1000));
          data.expiresAt = expiresAt.toISOString();

          console.log(`[PIPELINE][PURGE] Notification scheduled for disposal: ${expiresAt.toLocaleDateString()}`);
        }
        return data;
      }
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create' && doc.priority === 'critical') {
           /** PROTOCOLO HEIMDALL: Alerta de Alta Prioridad en Logs de Servidor */
           console.error(`[SYSTEM_ALERT][CRITICAL] Trace_ID: ${doc.traceId} | Node: ${doc.source} | Msg: ${doc.subject}`);
        }
      }
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Signal Identity',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'subject', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '70%', placeholder: 'Asunto de la transmisión' } 
                },
                {
                  name: 'priority',
                  type: 'select',
                  required: true,
                  defaultValue: 'low',
                  options: [
                    { label: 'Normal (Level 0)', value: 'low' },
                    { label: 'Elevated (Level 1)', value: 'high' },
                    { label: 'Critical (Infrastructure)', value: 'critical' }
                  ],
                  admin: { width: '30%' }
                }
              ]
            },
            { name: 'message', type: 'textarea', required: true },
          ]
        },
        {
          label: 'Operational Trace',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'source', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '50%', description: 'Nodo o Sistema de origen (ej: REVENUE_ENGINE).' } 
                },
                { 
                  name: 'traceId', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '50%', description: 'ID único de seguimiento forense.' } 
                }
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'originNode', type: 'text', admin: { width: '50%', description: 'IP o Contexto del despachador.' } },
                { name: 'isRead', type: 'checkbox', defaultValue: false, admin: { width: '50%' } }
              ]
            },
            { name: 'metadata', type: 'json', admin: { description: 'Payload técnico adicional de la señal.' } }
          ]
        },
        {
          label: 'Management & Compliance',
          fields: [
            { 
              name: 'tenant', 
              type: 'relationship', 
              relationTo: 'tenants', 
              required: true, 
              index: true,
              admin: { position: 'sidebar', description: 'Perímetro de propiedad.' } 
            },
            { 
              name: 'expiresAt', 
              type: 'date', 
              index: true,
              admin: { 
                position: 'sidebar', 
                readOnly: true,
                description: 'Fecha programada para el Auto-Purge industrial.' 
              } 
            },
            { name: 'readAt', type: 'date', admin: { position: 'sidebar', readOnly: true } }
          ]
        }
      ]
    }
  ]
};