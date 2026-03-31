/**
 * @file packages/cms/core/src/collections/FlashSales.ts
 * @description Enterprise Revenue Catalyst Engine (Silo A).
 *              Orquesta la gestión de inventario promocional con lógica de
 *              agotamiento de stock y expiración cronológica automatizada.
 *              Implementa validación perimetral para evitar inconsistencias de inventario.
 * @version 4.1 - Strict Payload 3.0 Compliance (Fix TS2353)
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const FlashSales: CollectionConfig = {
  slug: 'flash-sales',
  admin: {
    useAsTitle: 'title',
    group: 'Revenue Operations',
    defaultColumns: ['title', 'currentStock', 'status', 'expiresAt', 'tenant'],
    description: 'Gestión automatizada de ofertas relámpago y catalizadores de conversión.',
  },

  /**
   * REGLAS DE ACCESO SOBERANO
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE CICLO DE VIDA (Business Logic Hooks)
   */
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // 1. Garantía de Perímetro (Tenant Inheritance segura)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 2. Motor de Slugificación (UX Automation)
        if (data.title && !data.slug) {
          data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        // 3. Auditoría de Integridad de Inventario
        if (data.currentStock > data.totalInventory) {
          console.warn(`[REVENUE-AUDIT] Correction applied: Stock cannot exceed total capacity.`);
          data.currentStock = data.totalInventory;
        }

        // 4. Motor de Estado Dinámico (Automated Status)
        const now = new Date();
        const expirationDate = new Date(data.expiresAt);

        if (expirationDate < now) {
          data.status = 'expired';
        } else if (data.currentStock === 0) {
          data.status = 'sold_out';
        } else if (!data.status || data.status === 'draft') {
          // Si no es borrador, por defecto queda activo si hay stock y tiempo
          data.status = 'active';
        }

        return data;
      }
    ],
    afterChange: [
      ({ doc, operation, previousDoc }) => {
        // Telemetría de Rendimiento Comercial (Heimdall)
        if (operation === 'update' && doc.currentStock !== previousDoc?.currentStock) {
           console.log(`[REVENUE][INVENTORY] Item: ${doc.slug} | Sold: ${previousDoc?.currentStock - doc.currentStock} | Remaining: ${doc.currentStock}`);
        }
      }
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Campaign Strategy',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'title', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '70%', placeholder: 'Ej: Madrugada_Explosiva_50_Off' } 
                },
                { 
                  name: 'slug', 
                  type: 'text', 
                  unique: true, 
                  index: true, 
                  admin: { width: '30%', description: 'ID Semántico para la URL.' } 
                },
              ]
            },
            {
              type: 'row',
              fields: [
                { 
                  name: 'basePrice', 
                  type: 'number', 
                  required: true, 
                  admin: { width: '33%', description: 'Precio original sin descuento.' } 
                },
                { 
                  name: 'discountValue', 
                  type: 'number', 
                  required: true, 
                  min: 1, 
                  max: 95, 
                  // @fix TS2353: 'addonAfter' purgado. Intención delegada a la descripción.
                  admin: { width: '33%', description: 'Descuento aplicado en porcentaje (%)' } 
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'draft',
                  required: true,
                  options: [
                    { label: 'Draft / Private', value: 'draft' },
                    { label: 'Active (On Air)', value: 'active' },
                    { label: 'Sold Out', value: 'sold_out' },
                    { label: 'Expired', value: 'expired' }
                  ],
                  admin: { width: '34%' }
                }
              ]
            },
            { name: 'description', type: 'textarea', required: true },
          ]
        },
        {
          label: 'Inventory & Timeline',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'totalInventory', 
                  type: 'number', 
                  required: true, 
                  admin: { width: '33%', description: 'Capacidad máxima de la campaña.' } 
                },
                { 
                  name: 'currentStock', 
                  type: 'number', 
                  required: true, 
                  admin: { width: '33%', description: 'Stock real disponible.' } 
                },
                { 
                  name: 'expiresAt', 
                  type: 'date', 
                  required: true, 
                  admin: { 
                    width: '34%', 
                    date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM HH:mm' } 
                  } 
                },
              ]
            },
            { 
              name: 'heroAsset', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
              admin: { description: 'Imagen de alta fidelidad optimizada para la conversión.' }
            },
          ]
        },
        {
          label: 'Infrastructure Context',
          fields: [
            { 
              name: 'tenant', 
              type: 'relationship', 
              relationTo: 'tenants', 
              required: true, 
              index: true,
              admin: { position: 'sidebar', description: 'Perímetro de la propiedad.' } 
            },
          ]
        }
      ]
    }
  ]
};