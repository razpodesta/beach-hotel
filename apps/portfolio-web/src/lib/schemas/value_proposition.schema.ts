/**
 * @file value_proposition.schema.ts
 * @description Contrato Soberano para la Propuesta de Valor y Amenidades.
 *              Nivelado: Exportación explícita de tipos inferidos para resolver TS2305/TS2724.
 * @version 8.0 - Full Type Inference Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * CATÁLOGO DE ICONOS PERMITIDOS
 * @description Única fuente de verdad para los glifos de amenidades.
 */
export const AmenityIconKey = z.enum([
  'wifi', 'waves', 'utensils', 'dumbbell', 'shield', 
  'coffee', 'car', 'sparkles', 'disc', 'martini', 
  'ship', 'ticket', 'music', 'pin', 'users', 'flame'
]);

/** @type AmenityIconType - Inferencia para el mapeo de componentes visuales */
export type AmenityIconType = z.infer<typeof AmenityIconKey>;

/**
 * ESQUEMA: amenitySchema
 * @description Define una unidad individual de servicio.
 */
export const amenitySchema = z.object({
  name: z.string().min(1),
  iconKey: AmenityIconKey,
});

/** @type Amenity - Inferencia para props de sub-componentes */
export type Amenity = z.infer<typeof amenitySchema>;

/**
 * ESQUEMA MAESTRO: valuePropositionSectionSchema
 * @description Orquestador del contenido de valor de la landing.
 */
export const valuePropositionSectionSchema = z.object({
  badge_label: z.string().min(1),
  amenities_title: z.string().min(1),
  amenities_cta: z.string().min(1),
  amenities_hotel: z.array(amenitySchema).min(1),
  amenities_festival: z.array(amenitySchema).min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  pillars: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).length(3),
  testimonial: z.object({
    quote: z.string().min(1),
    author_name: z.string().min(1),
    author_role: z.string().min(1),
    avatar_url: z.string().min(1),
  }),
});

export type ValuePropositionDictionary = z.infer<typeof valuePropositionSectionSchema>;