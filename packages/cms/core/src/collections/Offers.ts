/**
 * @file packages/cms/core/src/collections/Offers.ts
 * @description Colección soberana para la gestión de Paquetes, Programas y Promociones.
 *              Implementa orquestación Multi-Tenant, matrices de precios y 
 *              control de validez cronológica.
 * @version 1.1 - Schema Hardened Edition (Renamed Assets for Type Integrity)
 * @author Raz Podestá - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const Offers: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'title',
    group: 'Hospitality Assets',
    defaultColumns: ['title', 'type', 'basePrice', 'tenant', 'status'],
    description: 'Gestão estratégica de pacotes turísticos e programas de viagem.',
  },

  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // 1. Garantía de Identidad Multi-Tenant (Relacional)
        if (operation === 'create' && req.user) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }
        
        // 2. Autogeneración de Slug (SSoT Editorial)
        if (data.title && typeof data.title === 'string' && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
        
        return data;
      },
    ],
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Definição da Oferta',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                { name: 'slug', type: 'text', unique: true, index: true, admin: { width: '30%' } },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  defaultValue: 'package',
                  options: [
                    { label: 'Pacote de Hospedagem', value: 'package' },
                    { label: 'Programa de Viagem', value: 'program' },
                    { label: 'Promoção Flash', value: 'promo' },
                  ],
                  admin: { width: '50%' }
                },
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'draft',
                  options: [
                    { label: 'Rascunho', value: 'draft' },
                    { label: 'Ativo', value: 'published' },
                  ],
                  admin: { width: '50%' }
                }
              ]
            },
            { name: 'description', type: 'textarea', required: true },
          ]
        },
        {
          label: 'Logística e Inclusões',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'nightsCount', type: 'number', min: 1, defaultValue: 1, admin: { width: '33%' } },
                { name: 'basePrice', type: 'number', required: true, admin: { width: '33%' } },
                { name: 'currency', type: 'select', defaultValue: 'BRL', options: ['BRL', 'USD', 'ARS'], admin: { width: '34%' } },
              ]
            },
            {
              name: 'inclusions',
              type: 'array',
              label: 'Itens Inclusos (Luxe)',
              fields: [{ name: 'item', type: 'text', required: true }],
              admin: { description: 'Ex: Café da manhã gourmet, Transfer in/out, Late check-out.' }
            }
          ]
        },
        {
          label: 'Fronteiras e Ativos',
          fields: [
            {
              name: 'tenant',
              type: 'relationship',
              relationTo: 'tenants',
              required: true,
              index: true,
              admin: { position: 'sidebar', readOnly: true }
            },
            {
              /** 
               * @fix: Renombrado a heroAsset para forzar recreación de columna 
               * tipo VARCHAR/UUID y eliminar el error de cast a INT.
               */
              name: 'heroAsset',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Imagem de impacto para a galeria de ofertas.' }
            },
            {
              type: 'row',
              fields: [
                { name: 'validFrom', type: 'date', admin: { width: '50%' } },
                { name: 'validUntil', type: 'date', admin: { width: '50%' } },
              ]
            }
          ]
        }
      ]
    }
  ]
};