// RUTA: apps/portfolio-web/src/lib/schemas/quienes_somos.schema.ts
import { z } from 'zod';

export const quienesSomosSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  hero_title: z.string(),
  hero_subtitle: z.string(),
  
  // Pilares de hospitalidad
  luxury_pillar: z.object({ title: z.string(), description: z.string() }),
  comfort_pillar: z.object({ title: z.string(), description: z.string() }),
  service_pillar: z.object({ title: z.string(), description: z.string() }),
  
  cta_title: z.string(),
  cta_button: z.string(),
});