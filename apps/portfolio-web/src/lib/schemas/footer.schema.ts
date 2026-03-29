/**
 * @file footer.schema.ts
 * @description Contrato soberano para el Shell de Cierre (Layout Footer).
 *              Refactorizado: Purga de campos de captación (delegados a newsletter_form).
 * @version 5.0 - Structural Purity
 */

import { z } from 'zod';

export const footerSchema = z.object({
  // Branding institucional
  brand_description: z.string().min(1),

  // Títulos de columnas de navegación
  column_nav_title: z.string().min(1),
  column_services_title: z.string().min(1),
  column_legal_title: z.string().min(1),

  // Etiquetas de links y acciones
  label_photos: z.string().min(1),
  label_cancellation: z.string().min(1),
  label_rules: z.string().min(1),
  label_blog: z.string().min(1),
  label_lgpd: z.string().min(1),
  label_dpo: z.string().min(1),
  label_all_rights: z.string().min(1),
  label_author_prefix: z.string().min(1),

  // Identidad de Infraestructura
  rights_reserved: z.string().min(1),
  made_by: z.string().min(1),
});

export type FooterDictionary = z.infer<typeof footerSchema>;