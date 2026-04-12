/**
 * @file suite_gallery.schema.ts
 * @description Contrato Soberano para el catálogo de activos inmobiliarios.
 *              Refactorizado: Taxonomía dinámica. Se elimina el Enum rígido 
 *              para soportar categorías personalizadas por cada Tenant.
 * @version 6.0 - Dynamic Taxonomy & S3 Ready
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
  /** 
   * @property category
   * @description Identificador técnico de la categoría (ej: 'Master', 'Penthouse').
   * Se utiliza como llave para el filtrado y para buscar la etiqueta en el diccionario.
   */
  category: z.string().min(1),
  /** URL absoluta (S3) o ruta local (Fallback) */
  imageUrl: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
});

/**
 * ESQUEMA: suiteGallerySchema
 * @description Diccionario de interfaz para la consola de selección de suites.
 */
export const suiteGallerySchema = z.object({
  title: z.string().min(1),
  search_placeholder: z.string().min(1),
  
  /** 
   * @property category_filters
   * @description Mapa dinámico de etiquetas para el menú de filtrado.
   * Permite traducir cualquier categoría definida en el CMS.
   */
  category_filters: z.record(z.string(), z.string()),

  // --- ETIQUETAS DE HOSPITALIDAD ---
  label_from: z.string().min(1),
  label_suite_suffix: z.string().min(1),

  // --- ESTADOS DE RESILIENCIA ---
  empty_state_title: z.string().min(1),
  empty_state_signal: z.string().min(1),
});

export type SuiteGalleryDictionary = z.infer<typeof suiteGallerySchema>;
export type SuiteEntry = z.infer<typeof suiteEntrySchema>;