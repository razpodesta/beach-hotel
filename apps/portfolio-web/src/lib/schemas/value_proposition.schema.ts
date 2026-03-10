// RUTA: apps/portfolio-web/src/lib/schemas/value_proposition.schema.ts
// VERSIÓN: 3.0 - Mutación a Amenities
// DESCRIPCIÓN: Contrato de datos adaptado para la nueva sección de Amenities.

import { z } from 'zod';

export const valuePropositionSectionSchema = z.object({
  amenities_title: z.string(), // <-- RENOMBRADO
  amenities_cta: z.string(),   // <-- RENOMBRADO
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