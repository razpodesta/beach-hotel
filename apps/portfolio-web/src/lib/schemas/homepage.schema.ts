/**
 * @file apps/portfolio-web/src/lib/schemas/homepage.schema.ts
 * @description Esquema soberano de validación para la página de inicio.
 *              Define el contrato innegociable para la integración CMS e i18n.
 * @version 5.0 - WebGL Asset Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';
import { heroSchema } from './hero.schema';
import { aboutSectionSchema } from './about_section.schema';
import { valuePropositionSectionSchema } from './value_proposition.schema';
import { contactMessagesSchema } from './contact.schema';
import { historySectionSchema } from './history_section.schema';

/**
 * Esquema para un ítem individual de la galería IA.
 */
const galleryItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

/**
 * ESQUEMA: aiGallerySectionSchema
 * @pilar III: Inferencia Obligatoria.
 * Sincronizado con OrbitalGallery v4.2 y los diccionarios de mensajes.
 */
export const aiGallerySectionSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  overlay_indicator: z.string(),
  
  // --- INICIO DE NIVELACIÓN DE INTERACCIÓN WEBGL ---
  /** @property drag_label - Etiqueta de instrucción para el carrusel orbital */
  drag_label: z.string().min(1),
  /** @property item_prefix - Prefijo para el contador de activos */
  item_prefix: z.string().min(1),
  /** @property error_fallback - Mensaje de rescate ante fallos de GPU */
  error_fallback: z.string().min(1),
  // --- FIN DE NIVELACIÓN ---

  footer_prompt: z.string(),
  footer_upscaling: z.string(),
  items: z.record(z.string(), galleryItemSchema),
});

/**
 * ESQUEMA MAESTRO: homepageSchema
 */
export const homepageSchema = z.object({
  hero: heroSchema,
  about_section: aboutSectionSchema,
  value_proposition_section: valuePropositionSectionSchema,
  contact: contactMessagesSchema,
  history_section: historySectionSchema,
  ai_gallery_section: aiGallerySectionSchema,
});

export type HomepageDictionary = z.infer<typeof homepageSchema>;