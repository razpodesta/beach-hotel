/**
 * @file registration_form.schema.ts
 * @description Enterprise Partner Onboarding Contract.
 *              Define la validación para la captura de aliados fiscales en múltiples jurisdicciones.
 * @version 1.0 - B2B Professional Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const partnerFormSchema = z.object({
  title: z.string().min(1),
  section_corporate: z.string().min(1),
  section_legal: z.string().min(1),
  
  // Enterprise Identity Labels
  label_brand_name: z.string().min(1),
  label_legal_name: z.string().min(1),
  label_tax_id: z.string().min(1), // Dinámico: CNPJ / RUT / TaxID
  placeholder_tax_id: z.string().min(1),
  label_website: z.string().min(1),
  label_iata: z.string().min(1),

  // KYB (Know Your Business) Labels
  label_representative_name: z.string().min(1),
  label_representative_email: z.string().min(1),
  label_representative_birth: z.string().min(1),
  label_representative_phone: z.string().min(1),

  // Operational Actions
  btn_submit: z.string().min(1),
  success_msg: z.string().min(1),
  
  // Validation Protocols (Localized)
  validation: z.object({
    tax_id_invalid: z.string().min(1),
    birth_date_required: z.string().min(1),
    email_invalid: z.string().min(1),
    phone_invalid: z.string().min(1),
  })
});

export type PartnerFormDictionary = z.infer<typeof partnerFormSchema>;