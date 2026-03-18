/**
 * @file apps/portfolio-web/src/lib/schemas/history_section.schema.ts
 * @description Contrato Soberano para la sección de historia institucional.
 *              Valida la narrativa central del legado de marca.
 * @version 1.1 - Production-Ready Strict Validation
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @description Esquema inmutable para la HistorySection.
 * @pilar III: Seguridad de Tipos Absoluta.
 * La validación .min(1) garantiza que el CMS no publique secciones vacías.
 */
export const historySectionSchema = z.object({
  /** Título de impacto narrativo */
  title: z.string().min(1, 'History title is required'),
  
  /** Bajada de texto explicativa del legado */
  subtitle: z.string().min(1, 'History subtitle is required'),
});

/** Tipo inferido para consumo en componentes y diccionarios */
export type HistorySectionDictionary = z.infer<typeof historySectionSchema>;