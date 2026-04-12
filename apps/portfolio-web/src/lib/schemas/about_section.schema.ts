/**
 * @file about_section.schema.ts
 * @description Contrato Soberano para la Narrativa Institucional.
 *              Refactorizado: Desacoplamiento visual (S3 Ready). Se inyecta
 *              soporte para URLs dinámicas de activos multimedia.
 * @version 3.0 - Tenant Awakening (S3 Vault Integration)
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const aboutSectionSchema = z.object({
  /** Título de impacto editorial */
  title: z.string().min(1),
  /** Etiqueta de cronología o identidad (ej: "Since 2026") */
  badge_label: z.string().min(1),
  /** 
   * @property image_url
   * @description Ruta o URL absoluta del activo en la bóveda S3 (Supabase).
   * Es opcional temporalmente para permitir retrocompatibilidad con los JSONs actuales.
   */
  image_url: z.string().optional(),
  /** Colección de párrafos con soporte para resaltado dinámico */
  paragraphs: z.array(z.object({
    text: z.string().min(1),
    highlight: z.string().optional(),
  })),
  /** Etiqueta del botón de acción */
  cta_button: z.string().min(1),
});

export type AboutDictionary = z.infer<typeof aboutSectionSchema>;