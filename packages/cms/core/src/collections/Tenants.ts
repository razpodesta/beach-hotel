/**
 * @file packages/cms/core/src/collections/Tenants.ts
 * @description Colección soberana para la gestión de propiedades (Multi-Tenancy).
 *              Orquesta las fronteras de datos para el Hotel, Festival y Journal.
 *              Nivelado para resolución nativa en Next.js 15 y observabilidad forense.
 * @version 2.2 - ESM Resolution & Linter Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import type { CollectionConfig } from 'payload';

/**
 * IMPORTACIONES DE PERÍMETRO (Saneadas)
 * @fix Resolución TS2835: Extensión .js obligatoria para resolución en ESM/nodenext.
 */
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

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
    beforeChange: [
      ({ data, operation: _operation }) => {
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
    afterChange: [
      ({ doc, operation: _operation }) => {
        // Corrección TS6133: operación marcada con guion bajo
        if (_operation === 'create') {
          console.log(`[HEIMDALL][INFRASTRUCTURE] New Property Created: ${doc.name} (ID: ${doc.id})`);
        }
      }
    ]
  },

  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: {
        description: 'Identificador único de infraestructura (UUID).',
        position: 'sidebar'
      }
    },
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