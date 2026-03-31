/**
 * @file BusinessMetrics.ts
 * @description Registro forense de transacciones y leads B2B.
 */

import { type CollectionConfig } from 'payload';

export const BusinessMetrics: CollectionConfig = {
  slug: 'business-metrics',
  admin: {
    group: 'Partner Network',
    defaultColumns: ['type', 'agency', 'agent', 'status', 'createdAt'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { 
          name: 'type', 
          type: 'select', 
          required: true, 
          options: [
            { label: 'Reserva Confirmada', value: 'booking_success' },
            { label: 'Cancelación / Fallo', value: 'booking_failed' },
            { label: 'Consulta (Lead)', value: 'inquiry' }
          ],
          admin: { width: '50%' }
        },
        { name: 'value', type: 'number', admin: { width: '50%', description: 'Valor económico del negocio.' } }
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'agency', type: 'relationship', relationTo: 'agencies', required: true, admin: { width: '50%' } },
        { name: 'agent', type: 'relationship', relationTo: 'agents', required: true, admin: { width: '50%' } }
      ]
    },
    { name: 'metaData', type: 'json', admin: { description: 'Detalles técnicos de la transacción.' } }
  ]
};