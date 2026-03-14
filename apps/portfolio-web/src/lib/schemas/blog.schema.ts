/**
 * @file apps/portfolio-web/src/lib/schemas/blog.schema.ts
 * @description Contrato soberano para el Hub Editorial.
 *              Sincronizado con la colección del CMS Core y la Media Library.
 * @version 6.0 - Media & i18n Template Integration
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * ESQUEMA: blogPostMetadataSchema
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export const blogPostMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  published_date: z.string(),
  tags: z.array(z.string()),
  /**
   * @property ogImage
   * Referencia dinámica a la URL de la Media Library del CMS.
   */
  ogImage: z.string().url().optional().nullable(),
});

/**
 * ESQUEMA: blogPageSchema
 * @pilar VI: Lógica i18n Soberana para plantillas dinámicas.
 */
export const blogPageSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  hero_title: z.string(),
  featured_title: z.string(),
  all_posts_title: z.string(),
  read_more_cta: z.string(),
  empty_state: z.string(),
  // --- NIVELACIÓN DE PLANTILLAS DE TAXONOMÍA ---
  /** @property tag_results_singular - Plantilla para un único resultado */
  tag_results_singular: z.string().min(1),
  /** @property tag_results_plural - Plantilla para múltiples resultados */
  tag_results_plural: z.string().min(1),
});

export const postWithSlugSchema = z.object({
  slug: z.string().min(1),
  metadata: blogPostMetadataSchema,
  content: z.string().optional(),
});

export type BlogPost = z.infer<typeof blogPostMetadataSchema>;
export type PostWithSlug = z.infer<typeof postWithSlugSchema>;
export type BlogPageDictionary = z.infer<typeof blogPageSchema>;