// RUTA: apps/portfolio-web/src/lib/schemas/guest_experience.schema.ts
// VERSIÓN: 1.0 - Hospitality Focus
// DESCRIPCIÓN: Contrato para la sección de Experiencia del Huésped.

import { z } from 'zod';

export const guestExperienceSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  intro_title: z.string(),
  intro_subtitle: z.string(),
  
  // Pilares de la experiencia en lugar de "Actos"
  luxury_pillar: z.object({ title: z.string(), description: z.string() }),
  comfort_pillar: z.object({ title: z.string(), description: z.string() }),
  service_pillar: z.object({ title: z.string(), description: z.string() }),
  
  cta_title: z.string(),
  cta_button: z.string(),
});