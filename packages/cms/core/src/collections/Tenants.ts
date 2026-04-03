/**
 * @file packages/cms/core/src/collections/Tenants.ts
 * @description Colección soberana para la gestión de propiedades (Multi-Tenancy).
 *              Refactorizado: Erradicación del campo 'id' manual para compatibilidad 
 *              con UUID nativo de Payload 3.0.
 * @version 3.1 - Payload Native ID Compliance
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Infrastructure',
    description: 'Gestión de propiedades digitales y perímetros de datos.',
    defaultColumns: ['name', 'slug', 'domain', 'id'],
  },

  /**
   * REGLAS DE ACCESO PERIMETRAL
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   */
  hooks: {
    beforeChange:[
      ({ data }) => { 
        // 1. Slugificación Automática (Fail-Safe)
        if (data.name && typeof data.name === 'string' && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
        return data;
      },
    ],
    afterChange:[
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`[HEIMDALL][INFRASTRUCTURE] New Property Created: ${doc.name} (ID: ${doc.id})`);
        }
      }
    ]
  },

  fields:[
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Ej: Beach Hotel Canasvieiras',
        description: 'Nombre comercial de la propiedad.'
      }
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Identificador semántico para URLs (kebab-case).'
      }
    },
    {
      name: 'domain',
      type: 'text',
      unique: true,
      admin: {
        description: 'Dominio DNS vinculado a esta propiedad (ej: hotel.com).',
        placeholder: 'https://...'
      },
    },
  ],
};