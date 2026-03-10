// RUTA: apps/portfolio-web/src/lib/schemas/quien_soy.schema.ts
// VERSIÓN: 2.0 - Expandido con el Acto V: El Arsenal de Crecimiento.
// DESCRIPCIÓN: Se añade un quinto acto a la narrativa para incorporar la
//              experiencia en marketing de conversión y estrategias de crecimiento.

import { z } from 'zod';

// Exportamos el tipo de una sección para reutilizarlo
export const sectionSchema = z.object({
  title: z.string(),
  description: z.string(),
});
export type Section = z.infer<typeof sectionSchema>;

export const quienSoySchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  intro_title: z.string(),
  intro_subtitle: z.string(),
  act_i: sectionSchema,
  act_ii: sectionSchema,
  act_iii: sectionSchema,
  act_iv: sectionSchema,
  act_v: sectionSchema,
});
