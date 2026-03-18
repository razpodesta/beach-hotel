import { z } from 'zod';

export const aboutSectionSchema = z.object({
  title: z.string(),
  // Refactorizado a estructura de párrafos para evitar inyección de HTML
  paragraphs: z.array(z.object({
    text: z.string(),
    highlight: z.string().optional(),
  })),
  cta_button: z.string(),
});