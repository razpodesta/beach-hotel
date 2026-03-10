// RUTA: apps/portfolio-web/src/lib/schemas/value_proposition.schema.ts
// VERSIÓN: 2.0 - Contratos de Texto de Sección de Tecnologías.
// DESCRIPCIÓN: Se renombra 'tech_carousel_title' a 'tech_stack_title' para mayor
//              claridad semántica y se añade 'tech_stack_cta' para la
//              internacionalización completa de la sección.

import { z } from 'zod';

export const valuePropositionSectionSchema = z.object({
  tech_stack_title: z.string(), // <-- CLAVE RENOMBRADA
  tech_stack_cta: z.string(),   // <-- NUEVA CLAVE
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
