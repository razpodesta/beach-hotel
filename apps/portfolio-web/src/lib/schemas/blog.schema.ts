/**
 * @file apps/portfolio-web/src/lib/schemas/blog.schema.ts
 * @description Contrato Soberano para el Hub Editorial (The Concierge Journal).
 *              Define la validación inmutable para metadatos, taxonomía y 
 *              páginas. Sincronizado con el motor de renderizado Next.js 15.
 * @version 8.0 - Absolute Path Support & Chrono-Validation
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * ESQUEMA: blogPostMetadataSchema
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Define el contrato de metadatos para un artículo.
 */
export const blogPostMetadataSchema = z.object({
  /** Título de impacto editorial */
  title: z.string().min(1, 'El título es obligatorio'),
  
  /** Resumen para SEO y tarjetas (Meta Description) */
  description: z.string().min(1, 'La descripción es obligatoria'),
  
  /** Nombre del autor o entidad editorial */
  author: z.string().min(1, 'El autor es obligatorio'),
  
  /** Fecha en formato ISO string (yyyy-mm-dd) */
  published_date: z.string().datetime({ message: 'Debe ser una fecha ISO válida' }),
  
  /** Colección de etiquetas para el motor de taxonomía */
  tags: z.array(z.string().trim().min(1))
    .transform(tags => tags.map(t => t.toLowerCase())),
    
  /**
   * Imagen de portada (OpenGraph).
   * @fix Soporta rutas locales (/images/...) y URLs absolutas (https://...).
   */
  ogImage: z.string().min(1).optional(),
});

/**
 * ESQUEMA: blogPageSchema
 * @pilar VI: Lógica i18n Soberana.
 * @description Define los tokens de traducción para la interfaz del blog.
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
 * @description Estructura final de un artículo procesado por el Shaper Polimórfico.
 */
export const postWithSlugSchema = z.object({
  /** Identificador semántico único para rumbos SEO */
  slug: z.string().min(1),
  /** Metadatos validados */
  metadata: blogPostMetadataSchema,
  /** Contenido en Markdown o HTML procesado */
  content: z.string().optional().default(''),
});

/**
 * INFERENCIA SOBERANA DE TIPOS
 * @pilar III: Inferencia obligatoria desde contrato Zod.
 */
export type BlogPost = z.infer<typeof blogPostMetadataSchema>;
export type PostWithSlug = z.infer<typeof postWithSlugSchema>;
export type BlogPageDictionary = z.infer<typeof blogPageSchema>;