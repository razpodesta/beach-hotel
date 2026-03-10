// RUTA: apps/portfolio-web/src/lib/schemas/about_section.schema.ts
// VERSIÓN: 2.0 - Contrato de datos con Llamada a la Acción (CTA).
// DESCRIPCIÓN: Se añade la propiedad 'cta_button' para el texto del botón que
//              enlazará a la página "Quién Soy".

import { z } from 'zod';

export const aboutSectionSchema = z.object({
  title: z.string(),
  bio_part_1: z.string(),
  bio_part_2: z.string(),
  cta_button: z.string(), // <-- Propiedad añadida
});
