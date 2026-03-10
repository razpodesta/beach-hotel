// RUTA: apps/portfolio-web/src/lib/schemas/blog.schema.ts
// VERSIÓN: 3.0 - Hospitality SSoT
// DESCRIPCIÓN: Se añaden 'hero_title' y 'empty_state' para garantizar i18n total.

import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  published_date: z.string(),
  tags: z.array(z.string()),
});

export const blogPageSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  hero_title: z.string(),
  featured_title: z.string(),
  all_posts_title: z.string(),
  read_more_cta: z.string(),
  empty_state: z.string(),
});

export const postWithSlugSchema = z.object({
  slug: z.string(),
  metadata: blogPostSchema,
  content: z.string(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;
export type PostWithSlug = z.infer<typeof postWithSlugSchema>;