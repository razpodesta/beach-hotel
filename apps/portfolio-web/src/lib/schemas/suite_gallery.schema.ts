/**
 * @file suite_gallery.schema.ts
 * @description Contrato Soberano para el catálogo de activos inmobiliarios.
 *              Nivelado para erradicar hardcoding y soportar estados de resiliencia.
 * @version 5.0 - Zero Hardcode & Luxury Labels Sync
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * ESQUEMA: suiteEntrySchema
 * @description Define la estructura de datos de una unidad habitacional.
 */
export const suiteEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['Master', 'Deluxe', 'Standard']),
  imageUrl: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
});

/**
 * ESQUEMA: suiteGallerySchema
 * @description Diccionario de interfaz para la consola de selección de suites.
 * @pilar VI: i18n Nativa - No se permiten textos fuera del contrato.
 */
export const suiteGallerySchema = z.object({
  title: z.string().min(1),
  search_placeholder: z.string().min(1),
  
  // --- CATEGORÍAS TRADUCIDAS ---
  cat_all: z.string().min(1),
  cat_master: z.string().min(1),
  cat_deluxe: z.string().min(1),
  cat_standard: z.string().min(1),

  // --- ETIQUETAS DE HOSPITALIDAD (Niveladas v5.0) ---
  /** @pilar VII: Erradicación de "From" hardcoded */
  label_from: z.string().min(1),
  /** @pilar VII: Erradicación de sufijos de suite hardcoded */
  label_suite_suffix: z.string().min(1),

  // --- ESTADOS DE RESILIENCIA (Pilar VIII) ---
  empty_state_title: z.string().min(1),
  empty_state_signal: z.string().min(1),
});

export type SuiteGalleryDictionary = z.infer<typeof suiteGallerySchema>;
export type SuiteEntry = z.infer<typeof suiteEntrySchema>;