/**
 * @file footer.schema.ts
 * @description Contrato Soberano para el Pie de Página y Cumplimiento Legal.
 * @version 4.0 - Global Trust Expansion
 */

import { z } from 'zod';

export const footerSchema = z.object({
  // --- CAPTACIÓN ---
  newsletter_title: z.string().min(1),
  newsletter_placeholder: z.string().min(1),
  newsletter_button: z.string().min(1),
  newsletter_success_title: z.string().min(1),
  newsletter_success_subtitle: z.string().min(1),
  newsletter_reward_label: z.string().min(1),

  // --- BRANDING ---
  brand_description: z.string().min(1),

  // --- TÍTULOS DE COLUMNA ---
  column_nav_title: z.string().min(1),
  column_services_title: z.string().min(1),
  column_legal_title: z.string().min(1),

  // --- ETIQUETAS DINÁMICAS (Nuevas) ---
  label_photos: z.string().min(1),
  label_cancellation: z.string().min(1),
  label_rules: z.string().min(1),
  label_blog: z.string().min(1),
  label_lgpd: z.string().min(1),
  label_dpo: z.string().min(1),
  label_all_rights: z.string().min(1),
  label_author_prefix: z.string().min(1),

  // --- INFRAESTRUCTRURA ---
  rights_reserved: z.string().min(1),
  made_by: z.string().min(1),
});

export type FooterDictionary = z.infer<typeof footerSchema>;