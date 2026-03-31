/**
 * @file registration.schema.ts
 * @description Contrato de validación para el Onboarding de Agencias Globales.
 *              Implementa validación dinámica basada en la jurisdicción fiscal.
 * @version 1.0 - Multi-Country Compliance Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/** 
 * CATÁLOGO DE JURISDICCIONES (Sincronizado con MACS)
 */
export const Jurisdictions = z.enum(['BR', 'CL', 'AR', 'UY', 'US', 'INTL']);

export const partnerRegistrationSchema = z.object({
  // --- IDENTIDAD CORPORATIVA ---
  brandName: z.string().min(2, 'BUSINESS_NAME_REQUIRED'),
  legalName: z.string().min(2, 'LEGAL_ENTITY_REQUIRED'),
  jurisdiction: Jurisdictions,
  
  /** 
   * @property taxId
   * @description Identificador fiscal dinámico (CNPJ, RUT, VAT). 
   * Se valida en la Server Action según el país.
   */
  taxId: z.string().min(5, 'TAX_ID_INVALID'),
  
  iataCode: z.string().optional(), // No obligatorio según directriz
  website: z.string().url('URL_INVALID').optional().or(z.literal('')),

  // --- REPRESENTACIÓN LEGAL (KYB) ---
  legalRepresentative: z.object({
    fullName: z.string().min(3, 'REPRESENTATIVE_REQUIRED'),
    email: z.string().email('EMAIL_INVALID'),
    phone: z.string().min(8, 'PHONE_INVALID'),
    birthDate: z.string().datetime('BIRTHDATE_REQUIRED'), // ISO String
  }),

  // --- LOCALIZACIÓN ---
  country: z.string().min(1),
  city: z.string().min(1),
  
  // --- INFRAESTRUCTRURA ---
  tenant: z.string().uuid('TENANT_CONTEXT_REQUIRED'),
});

export type PartnerRegistration = z.infer<typeof partnerRegistrationSchema>;