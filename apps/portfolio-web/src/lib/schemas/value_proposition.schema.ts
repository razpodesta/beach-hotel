/**
 * @file apps/portfolio-web/src/lib/schemas/value_proposition.schema.ts
 * @description Esquema de validación y fuente de verdad para la sección de propuesta de valor.
 *              Implementa taxonomía estricta para iconos de hospitalidad.
 * @version 5.0 - Strict Icon Mapping
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Catálogo de identificadores de iconos permitidos en la UI.
 * Sincronizado con ICON_MAP en el componente visual.
 */
export const AmenityIconKey = z.enum([
  'wifi', 'waves', 'utensils', 'dumbbell', 'shield', 
  'coffee', 'car', 'sparkles', 'disc', 'martini', 
  'ship', 'ticket', 'music', 'pin', 'users', 'flame'
]);

/**
 * Esquema de objeto Amenity individual.
 */
export const amenitySchema = z.object({
  name: z.string().min(1),
  iconKey: AmenityIconKey,
});

/**
 * Esquema maestro para la sección de Propuesta de Valor.
 */
export const valuePropositionSectionSchema = z.object({
  amenities_title: z.string(),
  amenities_cta: z.string(),
  // Arrays estrictamente tipados para evitar inferencia 'never'
  amenities_hotel: z.array(amenitySchema),
  amenities_festival: z.array(amenitySchema),
  title: z.string(),
  subtitle: z.string(),
  pillars: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).length(3),
  testimonial: z.object({
    quote: z.string(),
    author_name: z.string(),
    author_role: z.string(),
  }),
});

// Tipos inferidos soberanos
export type AmenityIconType = z.infer<typeof AmenityIconKey>;
export type Amenity = z.infer<typeof amenitySchema>;