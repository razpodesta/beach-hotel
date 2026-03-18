/**
 * @file homepage.schema.ts
 * @description Contrato soberano para la sección de Síntesis Visual (AI Gallery).
 *              Nivelado para la arquitectura plana del diccionario.
 * @version 6.1 - Sovereign Apparatus Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @description Esquema para los activos individuales de la galería.
 */
const galleryItemSchema = z.object({
  title: z.string().min(1, 'Item title is required'),
  description: z.string().min(1, 'Item description is required'),
});

/**
 * @description Esquema de la Sección de Síntesis Visual (WebGL).
 * Contrato innegociable para ai_gallery_section.json.
 */
export const aiGallerySectionSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  overlay_indicator: z.string().min(1),
  drag_label: z.string().min(1),
  item_prefix: z.string().min(1),
  error_fallback: z.string().min(1),
  footer_prompt: z.string().min(1),
  footer_upscaling: z.string().min(1),
  /** Mapeo dinámico de assets por ID */
  items: z.record(z.string(), galleryItemSchema),
});

/** 
 * TIPO SOBERANO INFERIDO
 */
export type AiGalleryDictionary = z.infer<typeof aiGallerySectionSchema>;