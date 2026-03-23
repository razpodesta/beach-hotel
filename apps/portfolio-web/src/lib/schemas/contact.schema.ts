/**
 * @file contact.schema.ts
 * @description Contrato Soberano para el Concierge Desk.
 * @version 2.0 - Full i18n & Feedback Sync
 */

import { z } from 'zod';

/**
 * FABRICA DE ESQUEMA DINÁMICA
 * @description Inyecta mensajes de error localizados desde el diccionario.
 */
export const createContactFormSchema = (v: Record<string, string>) => z.object({
  name: z.string().min(1, v.name_required),
  email: z.string().email(v.email_invalid).min(1, v.email_required),
  message: z.string().min(10, v.message_too_short),
});

export type ContactFormData = z.infer<ReturnType<typeof createContactFormSchema>>;

/**
 * ESQUEMA DE DICCIONARIO
 */
export const contactMessagesSchema = z.object({
  title: z.string().min(1),
  form_cta: z.string().min(1),
  form_placeholder_name: z.string().min(1),
  form_placeholder_email: z.string().min(1),
  form_placeholder_message: z.string().min(1),
  form_button_submit: z.string().min(1),
  form_button_loading: z.string().min(1),
  // --- FEEDBACK STRINGS (Niveladas) ---
  success_title: z.string().min(1),
  success_subtitle: z.string().min(1),
  error_submit: z.string().min(1),
  /** Mapeo de validaciones */
  validation: z.record(z.string(), z.string()),
});