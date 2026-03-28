/**
 * @file history_section.schema.ts
 * @description Contrato Soberano para la sección de historia institucional.
 * @version 1.2 - Full i18n Integration
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @description Esquema inmutable para la HistorySection.
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const historySectionSchema = z.object({
  /** Etiqueta superior decorativa (ej: "The Legacy") */
  badge_label: z.string().min(1, 'Badge label is required'),
  /** Título de impacto narrativo */
  title: z.string().min(1, 'History title is required'),
  /** Bajada de texto explicativa del legado */
  subtitle: z.string().min(1, 'History subtitle is required'),
});

export type HistorySectionDictionary = z.infer<typeof historySectionSchema>;