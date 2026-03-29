/**
 * @file newsletter_form.schema.ts
 * @description Contrato soberano para el aparato de captación de leads.
 *              Desacoplado del footer para permitir su uso en modales o sidebars.
 * @version 1.0 - Atomic Congruence Standard
 */

import { z } from 'zod';

export const newsletterFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  placeholder: z.string().min(1),
  button: z.string().min(1),
  loading: z.string().min(1),
  success_title: z.string().min(1),
  success_subtitle: z.string().min(1),
  reward_label: z.string().min(1),
  legal_notice: z.string().min(1),
  
  // Mensajes de validación específicos del aparato
  validation_email_required: z.string().min(1),
  validation_email_invalid: z.string().min(1),
});

export type NewsletterFormDictionary = z.infer<typeof newsletterFormSchema>;