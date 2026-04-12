/**
 * @file homepage.schema.ts
 * @description Contrato soberano para la sección de Síntesis Visual (AI Gallery).
 *              Refactorizado: Arquitectura de Mapeo Editorial. Desacopla la 
 *              identidad visual (S3) de la narrativa traducida (JSON).
 * 
 * @version 7.0 - Data-Driven Mapping & SSoT Hardened
 * @author Raz Podestá - MetaShark Tech
 * 
 * @pilar III: Seguridad de Tipos - Validación estricta de metadatos de galería.
 * @pilar IX: Desacoplamiento - Permite que el orquestador inyecte activos desde el CMS.
 */

import { z } from 'zod';

/**
 * @description Esquema para los metadatos editoriales de un activo sintético.
 * No contiene la imagen, solo la capa narrativa.
 */
const galleryItemMetadataSchema = z.object({
  title: z.string().min(1, 'Item title is required'),
  description: z.string().min(1, 'Item description is required'),
});

/**
 * @description Esquema de la Sección de Síntesis Visual (WebGL).
 * Contrato innegociable para ai_gallery.json.
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

  /** 
   * @property items_metadata
   * @description Diccionario de textos indexado por el 'filename' o 'slug' 
   * del activo en el CMS. Permite hidratar la UI con traducciones dinámicas.
   */
  items_metadata: z.record(z.string(), galleryItemMetadataSchema),
});

/** 
 * TIPO SOBERANO INFERIDO
 */
export type AiGalleryDictionary = z.infer<typeof aiGallerySectionSchema>;