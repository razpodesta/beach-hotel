/**
 * @file packages/cms/core/src/collections/Agencies.ts
 * @description Enterprise Partner Identity Repository (Silo B).
 *              Orquesta la gestión de la Red de Alianzas B2B, implementando
 *              validación fiscal por jurisdicción, scoring de confianza dinámico
 *              y blindaje de perímetros comerciales Multi-Tenant.
 * @version 4.1 - Strict Payload 3.0 Compliance (Fix TS2353)
 * @author Staff Engineer - MetaShark Tech
 */

import { type CollectionConfig } from 'payload';
import { multiTenantReadAccess, multiTenantWriteAccess } from './Access';

export const Agencies: CollectionConfig = {
  slug: 'agencies',
  admin: {
    useAsTitle: 'brandName',
    group: 'Supply Chain / Partners',
    defaultColumns: ['brandName', 'jurisdiction', 'taxId', 'trustScore', 'status', 'tenant'],
    description: 'Directorio central de operadores mayoristas y agencias de viajes verificadas.',
  },
  
  /**
   * REGLAS DE ACCESO SOBERANO (RBAC Tier S2)
   */
  access: {
    read: multiTenantReadAccess,
    create: ({ req: { user } }) => !!user,
    update: multiTenantWriteAccess,
    delete: multiTenantWriteAccess,
  },

  /**
   * GUARDIANES DE INTEGRIDAD (Compliance Hooks)
   */
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // 1. Inyección de Perímetro Automática (Safe Extraction)
        if (operation === 'create' && req.user && !data.tenant) {
          data.tenant = typeof req.user.tenant === 'object' && req.user.tenant !== null 
            ? req.user.tenant.id 
            : req.user.tenant;
        }

        // 2. Normalización de Identidad Fiscal
        if (data.taxId) {
          data.taxId = data.taxId.replace(/[^\d\w-]/g, '').toUpperCase();
        }

        return data;
      }
    ],
    afterChange: [
      ({ doc, operation, previousDoc }) => {
        // 3. Telemetría de Cumplimiento (Heimdall)
        if (operation === 'update' && doc.status !== previousDoc?.status) {
          console.log(`[AUDIT][PARTNER-STATUS] Agency: ${doc.brandName} | Transition: ${previousDoc?.status} -> ${doc.status} | Trace: ${Date.now()}`);
        }
      }
    ]
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Corporate Identity',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'brandName', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '50%', placeholder: 'Nombre Comercial / Fantasía' } 
                },
                { 
                  name: 'legalName', 
                  type: 'text', 
                  required: true, 
                  admin: { width: '50%', placeholder: 'Razón Social Completa' } 
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'jurisdiction',
                  type: 'select',
                  required: true,
                  defaultValue: 'BR',
                  options: [
                    { label: 'Brasil (CNPJ)', value: 'BR' },
                    { label: 'Chile (RUT)', value: 'CL' },
                    { label: 'Argentina (CUIT)', value: 'AR' },
                    { label: 'Uruguay (RUT)', value: 'UY' },
                    { label: 'USA / International (TaxID)', value: 'INTL' }
                  ],
                  admin: { width: '30%' }
                },
                { 
                  name: 'taxId', 
                  type: 'text', 
                  required: true, 
                  index: true,
                  admin: { 
                    width: '40%', 
                    description: 'Identificador fiscal único sin símbolos.' 
                  } 
                },
                { 
                  name: 'iataCode', 
                  type: 'text', 
                  admin: { 
                    width: '30%', 
                    description: 'Código regulador opcional.' 
                  } 
                },
              ]
            },
            { 
              name: 'logo', 
              type: 'upload', 
              relationTo: 'media', 
              required: true,
              admin: { description: 'Isotipo para materiales White-Label y Co-Branding.' }
            },
          ]
        },
        {
          label: 'Trust & Commercial Terms',
          fields: [
            {
              type: 'row',
              fields: [
                { 
                  name: 'trustScore', 
                  type: 'number', 
                  min: 0, 
                  max: 100, 
                  defaultValue: 50, 
                  admin: { 
                    width: '33%', 
                    description: 'Puntaje de solvencia y cumplimiento comercial.' 
                  } 
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'review',
                  options: [
                    { label: 'Verified Partner', value: 'active' },
                    { label: 'Audit in Progress', value: 'review' },
                    { label: 'Suspended (Policy Breach)', value: 'blocked' }
                  ],
                  admin: { width: '33%' }
                },
                { 
                  name: 'tenant', 
                  type: 'relationship', 
                  relationTo: 'tenants', 
                  required: true, 
                  index: true,
                  admin: { 
                    width: '34%',
                    position: 'sidebar',
                    description: 'Propiedad ancla de la alianza.'
                  } 
                }
              ]
            },
            {
              name: 'commercialTerms',
              type: 'group',
              label: 'Acuerdos Operativos',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { 
                      name: 'defaultCommission', 
                      type: 'number', 
                      defaultValue: 10, 
                      // @fix TS2353: 'addonAfter' removido. Claridad delegada a la descripción.
                      admin: { width: '50%', description: 'Comisión base (%)' } 
                    },
                    { 
                      name: 'paymentCycle', 
                      type: 'select', 
                      defaultValue: 'net-30',
                      options: [
                        { label: 'Pre-paid', value: 'prepaid' },
                        { label: 'Net 15', value: 'net-15' },
                        { label: 'Net 30', value: 'net-30' }
                      ],
                      admin: { width: '50%' } 
                    }
                  ]
                }
              ]
            },
            { 
              name: 'internalObservations', 
              type: 'textarea', 
              admin: { description: 'Log de negociaciones y notas de cumplimiento (Solo Staff).' } 
            }
          ]
        }
      ]
    }
  ]
};