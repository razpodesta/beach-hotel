/**
 * @file apps/portfolio-web/src/lib/schemas/blog.schema.ts
 * @description Constitución Soberana de Datos Editoriales (The Journal Contract).
 *              Define la validación inmutable para el Hub Editorial, integrando
 *              inteligencia de atmósfera, métricas de lectura y resiliencia de activos.
 * @version 10.0 - Strict Build Resilience & Forensic TSDoc
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @description Enumeración de atmósferas permitidas para el renderizado dinámico.
 * day: Estética clara, luz solar, minimalismo sofisticado.
 * night: Estética Sanctuary Night, neones, inmersión festival.
 */
export const AtmosphereVibe = z.enum(['day', 'night']);

/**
 * @type AtmosphereVibeType
 * @description Inferencia del contrato de atmósfera para lógica de componentes.
 */
export type AtmosphereVibeType = z.infer<typeof AtmosphereVibe>;

/**
 * ESQUEMA: blogPostMetadataSchema
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Contrato de metadatos para la unidad editorial. Valida la integridad
 *              de los datos antes de su entrada al motor de renderizado.
 */
export const blogPostMetadataSchema = z.object({
  title: z.string().min(1, 'EDITORIAL_ERR: Title is mandatory for SEO'),
  description: z.string().min(1, 'EDITORIAL_ERR: Description required for E-E-A-T'),
  author: z.string().min(1, 'EDITORIAL_ERR: Author attribution required'),
  
  /** 
   * @property published_date 
   * @description Fecha en formato ISO 8601. Soporta la precisión de Supabase/PostgreSQL.
   */
  published_date: z.string().datetime({ message: 'DATA_ERR: Invalid ISO timestamp' }),
  
  /** 
   * @property vibe
   * @pilar XII: MEA/UX - Inyecta la identidad visual en la UI.
   * @fix Erradica fallos de resolución en actions.ts y components.
   */
  vibe: AtmosphereVibe.default('day'),

  /** 
   * @property readingTime 
   * @description Tiempo estimado (minutos). Calculado por el motor de ingesta.
   */
  readingTime: z.number().int().positive().optional(),
  
  /**
   * @property tags
   * @description Taxonomía de búsqueda. Normalización proactiva a minúsculas.
   */
  tags: z.array(z.string().trim().min(1))
    .min(1, 'TAXONOMY_ERR: At least one tag required')
    .transform(tags => tags.map(t => t.toLowerCase())),
    
  /**
   * @property ogImage
   * @description Imagen de alta fidelidad para OpenGraph y Hero.
   * Resiliencia: Soporta rutas internas y URLs externas firmadas.
   */
  ogImage: z.string()
    .url('ASSET_ERR: Invalid remote URL')
    .or(z.string().startsWith('/', 'ASSET_ERR: Invalid local path'))
    .optional(),
});

/**
 * ESQUEMA: blogPageSchema
 * @pilar VI: i18n Nativa - Erradicación de Hardcoding.
 * @description Contrato de traducción para el Shell del Hub Editorial.
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
 * @description Entidad final nivelada (Shaped Entity). 
 *              Garantiza que el contenido Markdown/MDX sea inyectado de forma segura.
 */
export const postWithSlugSchema = z.object({
  slug: z.string().min(1, 'ROUTING_ERR: Semantic slug required'),
  metadata: blogPostMetadataSchema,
  content: z.string().optional().default(''),
});

/**
 * INFERENCIA SOBERANA DE TIPOS (SSoT)
 * @pilar III: Inferencia obligatoria desde el Contrato Soberano.
 * Nunca definir interfaces manuales que dupliquen la lógica de Zod.
 */
export type BlogPost = z.infer<typeof blogPostMetadataSchema>;
export type PostWithSlug = z.infer<typeof postWithSlugSchema>;
export type BlogPageDictionary = z.infer<typeof blogPageSchema>;