/**
 * @file Tenants.ts
 * @description Colección soberana para la gestión de propiedades.
 *              Nivelado: Soporte de ID tipo Texto para integración inmaculada con UUID.
 * @version 1.1 - UUID Infrastructure Sync
 * @author Raz Podestá - MetaShark Tech
 */

import type { CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access.js';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Infrastructure',
  },
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'id',
      type: 'text',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Dominio opcional vinculado a este tenant.',
      },
    },
  ],
};