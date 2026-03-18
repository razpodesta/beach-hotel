/**
 * @file footer.schema.ts
 * @description Contrato inmutable para el pie de página institucional.
 * @version 3.1 - Elite Standard Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const footerSchema = z.object({
  /** Captación de leads */
  newsletter_title: z.string().min(1, 'Newsletter title is required'),
  newsletter_placeholder: z.string().min(1),
  newsletter_button: z.string().min(1),

  /** Títulos de columnas (Mapeados por nav-links.ts) */
  column_nav_title: z.string().min(1),
  column_services_title: z.string().min(1),
  column_legal_title: z.string().min(1),

  /** Copyright e Infraestructura */
  rights_reserved: z.string().min(1),
  made_by: z.string().min(1),
});

export type FooterDictionary = z.infer<typeof footerSchema>;