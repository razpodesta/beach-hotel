/**
 * @file apps/portfolio-web/src/lib/schemas/blog.schema.ts
 * @description Constitución Soberana para el Hub Editorial (The Concierge Journal).
 *              Define la validación inmutable para metadatos, atmósfera (Vibe) y 
 *              taxonomía. Sincronizado con el orquestador de datos v29.0.
 * @version 9.0 - Atmosphere & Reading Metrics Integration
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @description Enumeración de atmósferas permitidas para el renderizado dinámico.
 * day: Estética clara, minimalista, luz solar.
 * night: Estética oscura, neones, "Sanctuary Night".
 */
export const AtmosphereVibe = z.enum(['day', 'night']);
export type AtmosphereVibeType = z.infer<typeof AtmosphereVibe>;

/**
 * ESQUEMA: blogPostMetadataSchema
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Contrato de metadatos para la unidad editorial.
 */
export const blogPostMetadataSchema = z.object({
  title: z.string().min(1, 'title_required'),
  description: z.string().min(1, 'description_required'),
  author: z.string().min(1, 'author_required'),
  published_date: z.string().datetime({ message: 'invalid_iso_date' }),
  
  /** 
   * @property vibe
   * @description Determina la identidad lumínica de la tarjeta y el detalle.
   * @fix Erradica error TS2353 en actions.ts
   */
  vibe: AtmosphereVibe.default('day'),

  /** 
   * @property readingTime 
   * @description Tiempo estimado de lectura en minutos (opcional).
   */
  readingTime: z.number().int().min(1).optional(),
  
  tags: z.array(z.string().trim().min(1))
    .transform(tags => tags.map(t => t.toLowerCase())),
    
  /**
   * Imagen de portada (OpenGraph).
   * Soporta rutas locales (/images/...) y URLs de Supabase.
   */
  ogImage: z.string().url().or(z.string().startsWith('/')).optional(),
});

/**
 * ESQUEMA: blogPageSchema
 * @pilar VI: Lógica i18n Soberana.
 * @description Tokens de traducción para la interfaz del Hub Editorial.
 */
export const blogPageSchema = z.object({
  page_title: z.string().min(1),
  page_description: z.string().min(1),
  hero_title: z.string().min(1),
  featured_title: z.string().min(1),
  all_posts_title: z.string().min(1),
  read_more_cta: z.string().min(1),
  empty_state: z.string().min(1),
  tag_results_singular: z.string().min(1),
  tag_results_plural: z.string().min(1),
});

/**
 * ESQUEMA: postWithSlugSchema
 * @description Estructura final de un artículo tras el paso por el Shaper Soberano.
 */
export const postWithSlugSchema = z.object({
  slug: z.string().min(1),
  metadata: blogPostMetadataSchema,
  content: z.string().optional().default(''),
});

/**
 * INFERENCIA SOBERANA DE TIPOS
 * @pilar III: Inferencia obligatoria desde contrato Zod (SSoT).
 */
export type BlogPost = z.infer<typeof blogPostMetadataSchema>;
export type PostWithSlug = z.infer<typeof postWithSlugSchema>;
export type BlogPageDictionary = z.infer<typeof blogPageSchema>;