/**
 * @file footer.schema.ts
 * @description Contrato inmutable para el pie de página institucional.
 * @version 3.2 - Newsletter Feedback Sync
 */

import { z } from 'zod';

export const footerSchema = z.object({
  /** Captación de leads */
  newsletter_title: z.string().min(1),
  newsletter_placeholder: z.string().min(1),
  newsletter_button: z.string().min(1),
  
  // --- NUEVAS LLAVES DE FEEDBACK (Niveladas v3.2) ---
  newsletter_success_title: z.string().min(1),
  newsletter_success_subtitle: z.string().min(1),
  newsletter_reward_label: z.string().min(1),

  /** Títulos de columnas (Mapeados por nav-links.ts) */
  column_nav_title: z.string().min(1),
  column_services_title: z.string().min(1),
  column_legal_title: z.string().min(1),

  /** Copyright e Infraestructura */
  rights_reserved: z.string().min(1),
  made_by: z.string().min(1),
});

export type FooterDictionary = z.infer<typeof footerSchema>;