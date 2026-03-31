/**
 * @file packages/cms/core/src/collections/DynamicRoutes.ts
 * @description Orquestador de enrutamiento dinámico para puntos de acceso físicos.
 *              Permite la redirección de usuarios basada en tiempo y nivel de usuario.
 *              Refactorizado: Integración absoluta de Aislamiento Multi-Tenant y
 *              trazabilidad Heimdall.
 * @version 2.0 - Sovereign Routing Perimeter
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const DynamicRoutes: CollectionConfig = {
  slug: 'dynamic-routes',
  admin: {
    useAsTitle: 'internalReference',
    group: 'Infrastructure',
    defaultColumns: ['internalReference', 'routeKey', 'fallbackUrl', 'tenant'],
    description: 'Configuración de redirecciones inteligentes y contextuales para códigos QR.',
  },
  
  /**
   * REGLAS DE ACCESO SOBERANO (Aislamiento Multi-Tenant)
   * @pilar VIII: Resiliencia y Seguridad Perimetral.
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Tenant Injection Hooks)
   */
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Garantía de Perímetro: Inyección automática del Tenant del creador
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }
        return data;
      }
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update') {
          /** @pilar IV: Trazabilidad forense del mapeo de rutas */
          console.log(`[HEIMDALL][GATEWAY] Dynamic Route mapped: /r/${doc.routeKey} -> ${doc.fallbackUrl}`);
        }
      }
    ]
  },

  fields: [
    { 
      name: 'internalReference', 
      type: 'text', 
      required: true, 
      admin: { placeholder: 'Ej: Recepción - QR Mañana/Noche' } 
    },
    { 
      name: 'routeKey', 
      type: 'text', 
      unique: true, 
      index: true,
      required: true, 
      admin: { description: 'Identificador único para la URL: domain.com/r/[routeKey]' } 
    },
    {
      name: 'conditionalRules',
      type: 'array',
      label: 'Reglas de Enrutamiento',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'startTime', type: 'text', admin: { placeholder: '07:00', width: '25%' } },
            { name: 'endTime', type: 'text', admin: { placeholder: '11:00', width: '25%' } },
            { name: 'destinationUrl', type: 'text', required: true, admin: { width: '50%' } }
          ]
        },
        {
          name: 'requiredLoyaltyLevel',
          type: 'number',
          defaultValue: 0,
          admin: { description: 'Nivel mínimo de usuario requerido para este destino.' }
        }
      ]
    },
    { 
      name: 'fallbackUrl', 
      type: 'text', 
      required: true, 
      admin: { description: 'Destino predeterminado si no se cumplen las reglas.' } 
    },
    {
      /**
       * @property tenant
       * @description Vínculo inmutable con la propiedad anfitriona (Multi-Tenant).
       */
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { 
        position: 'sidebar',
        description: 'Perímetro físico al que pertenece este Gateway.'
      }
    }
  ]
};