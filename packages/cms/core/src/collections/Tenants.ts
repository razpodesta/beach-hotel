/**
 * @file packages/cms/core/src/collections/Tenants.ts
 * @description Colección soberana para la gestión de propiedades (Multi-Tenancy).
 *              Orquesta las fronteras de datos para el Hotel, Festival y Journal.
 *              Nivelado para resolución nativa en Next.js 15 y observabilidad forense.
 * @version 2.0 - UUID Sync & Automatic Slugification
 * @author Raz Podestá - MetaShark Tech
 */

import type { CollectionConfig } from 'payload';

/**
 * IMPORTACIONES DE PERÍMETRO (Saneadas)
 * @pilar V: Adherencia arquitectónica. Eliminación de extensión .js para 
 * garantizar resolución nativa de TypeScript en el empaquetado de Vercel.
 */
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
   * @pilar III: Seguridad de Tipos Absoluta.
   */
  access: {
    read: multiTenantReadAccess,
    // Solo el Administrador Maestro puede crear o eliminar propiedades raíz.
    create: ({ req: { user } }) => user?.role === 'admin',
    update: multiTenantWriteAccess,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Hooks)
   * @pilar VIII: Resiliencia - Automatización de metadatos sanitizados.
   */
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // 1. Slugificación Automática (Fail-Safe)
        if (data.name && typeof data.name === 'string' && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
            .replace(/\s+/g, '-');   // Reemplazar espacios por guiones
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`[HEIMDALL][INFRASTRUCTURE] New Property Created: ${doc.name} (ID: ${doc.id})`);
        }
      }
    ]
  },

  fields: [
    /**
     * @pilar I: Visión Holística - Soberanía UUID.
     * Mantenemos el ID como texto para permitir identificadores deterministas
     * y evitar errores de casteo en PostgreSQL remoto.
     */
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