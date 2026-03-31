/**
 * @file Agents.ts
 * @description Registro de profesionales de viajes. 
 *              Rastrea la trayectoria del individuo independiente de la agencia.
 * @version 1.0 - Professional Identity Tracker
 */

import { type CollectionConfig } from 'payload';

export const Agents: CollectionConfig = {
  slug: 'agents',
  admin: {
    useAsTitle: 'fullName',
    group: 'Partner Network',
    defaultColumns: ['fullName', 'currentAgency', 'successRate', 'status'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'fullName', type: 'text', required: true, admin: { width: '60%' } },
        { name: 'status', type: 'select', defaultValue: 'active', options: ['active', 'inactive', 'blacklisted'], admin: { width: '40%' } }
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true, unique: true, admin: { width: '50%' } },
        { name: 'phone', type: 'text', admin: { width: '50%' } }
      ]
    },
    {
      name: 'currentAgency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      admin: { description: 'Agencia activa donde opera el profesional.' }
    },
    {
      name: 'employmentHistory',
      type: 'array',
      label: 'Trayectoria Profesional (Log)',
      fields: [
        { name: 'agency', type: 'relationship', relationTo: 'agencies', required: true },
        { name: 'startDate', type: 'date', required: true },
        { name: 'endDate', type: 'date' },
        { name: 'reasonForDeparture', type: 'text' }
      ],
      admin: { description: 'Historial inmutable de vinculaciones anteriores.' }
    },
    {
      name: 'performanceMetrics',
      type: 'group',
      fields: [
        { name: 'dealsClosed', type: 'number', defaultValue: 0 },
        { name: 'dealsFailed', type: 'number', defaultValue: 0 },
        { name: 'totalRevenueGenerated', type: 'number', defaultValue: 0 }
      ]
    }
  ]
};