/**
 * @file packages/cms/core/src/lib/schemas/value_proposition.schema.ts
 * @description Contrato inmutable para la sección de Propuesta de Valor.
 *              Nivelado: Exportaciones tipadas definitivas.
 * @version 6.2 - Export Contract Sync
 */

import { z } from 'zod';

/** Catálogo de iconos permitidos (Zod Enum) */
export const AmenityIconKey = z.enum([
  'wifi', 'waves', 'utensils', 'dumbbell', 'shield', 
  'coffee', 'car', 'sparkles', 'disc', 'martini', 
  'ship', 'ticket', 'music', 'pin', 'users', 'flame'
]);

// Tipo inferido para uso en el MAPA DE ICONOS (evita errores TS2749)
export type AmenityIconType = z.infer<typeof AmenityIconKey>;

/** Esquema de ítem individual de amenidad */
export const amenitySchema = z.object({
  name: z.string().min(1, 'Amenity name is required'),
  iconKey: AmenityIconKey,
});

// Exportación explícita del tipo Amenity (resuelve TS2305)
export type Amenity = z.infer<typeof amenitySchema>;

/** Esquema maestro del aparato Value Proposition */
export const valuePropositionSectionSchema = z.object({
  amenities_title: z.string().min(1),
  amenities_cta: z.string().min(1),
  amenities_hotel: z.array(amenitySchema).min(1),
  amenities_festival: z.array(amenitySchema).min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  pillars: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).length(3, 'Value proposition must have exactly 3 pillars'),
  testimonial: z.object({
    quote: z.string().min(1),
    author_name: z.string().min(1),
    author_role: z.string().min(1),
  }),
});

export type ValuePropositionDictionary = z.infer<typeof valuePropositionSectionSchema>;