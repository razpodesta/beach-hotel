// RUTA: packages/cms/core/src/collections/Users.ts

/**
 * @file Colección: Users (Identidad Soberana)
 * @version 1.0 - Multi-Tenant & RBAC Ready
 * @description Define la estructura de identidad del sistema. Preparada para 
 *              gestionar permisos granulares y niveles de reputación (Protocolo 33).
 * @author Raz Podestá - MetaShark Tech
 */

import { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Seguridad de élite para tokens
    tokenExpiration: 7200, 
    verify: true, // Requerir verificación por email
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'level'],
  },
  access: {
    // RBAC: Solo los admins gestionan usuarios
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Sponsor', value: 'sponsor' },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    // Gamificación: Protocolo 33 Integration
    {
      name: 'level',
      type: 'number',
      defaultValue: 1,
      admin: { readOnly: true },
    },
    {
      name: 'experiencePoints',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    // Meta-datos de Infraestructura
    {
      name: 'tenantId',
      type: 'text',
      index: true, // Optimización para búsquedas multi-tenant
      admin: { hidden: true },
    },
  ],
};