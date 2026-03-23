/**
 * @file about_section.schema.ts
 * @description Contrato Soberano para la Narrativa Institucional.
 * @version 2.0 - Identity Badge Sync
 */

import { z } from 'zod';

export const aboutSectionSchema = z.object({
  /** Título de impacto editorial */
  title: z.string().min(1),
  /** Etiqueta de cronología o identidad (ej: "Since 2026") */
  badge_label: z.string().min(1),
  /** Colección de párrafos con soporte para resaltado dinámico */
  paragraphs: z.array(z.object({
    text: z.string().min(1),
    highlight: z.string().optional(),
  })),
  /** Etiqueta del botón de acción */
  cta_button: z.string().min(1),
});

export type AboutDictionary = z.infer<typeof aboutSectionSchema>;