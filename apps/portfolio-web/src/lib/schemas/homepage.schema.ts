// RUTA: apps/portfolio-web/src/lib/schemas/homepage.schema.ts
// VERSIÓN: 4.0 - Integración Definitiva de AI Gallery
// ESTADO: SSoT (Single Source of Truth) Actualizada

import { z } from 'zod';
import { heroSchema } from './hero.schema';
import { aboutSectionSchema } from './about_section.schema';
import { valuePropositionSectionSchema } from './value_proposition.schema';
import { contactMessagesSchema } from './contact.schema';
import { historySectionSchema } from './history_section.schema';

// 1. Definición del esquema para un ítem individual de la galería
const galleryItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// 2. Definición del esquema para la sección completa de AI
export const aiGallerySectionSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  overlay_indicator: z.string(),
  footer_prompt: z.string(),
  footer_upscaling: z.string(),
  // Record permite claves dinámicas (ids de imagen) con valores que siguen galleryItemSchema
  items: z.record(z.string(), galleryItemSchema),
});

// 3. Esquema Maestro de la Homepage
// Aquí es donde se "registran" todas las secciones permitidas.
export const homepageSchema = z.object({
  hero: heroSchema,
  about_section: aboutSectionSchema,
  value_proposition_section: valuePropositionSectionSchema,
  contact: contactMessagesSchema,
  history_section: historySectionSchema,
  ai_gallery_section: aiGallerySectionSchema, // <--- PROPIEDAD CRÍTICA AÑADIDA
});
