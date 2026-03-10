// RUTA: apps/portfolio-web/src/lib/schemas/blog.schema.ts
// VERSIÓN: 2.1 - Sincronizado con la Arquitectura Headless.
// DESCRIPCIÓN: Se añade la propiedad `content` al `postWithSlugSchema` para reflejar
//              la estructura de datos completa que proviene de la API del CMS,
//              reparando el contrato de datos y resolviendo errores de tipo.

import { z } from 'zod';

// Esquema para los metadatos de un único artículo del blog. (Sin cambios)
export const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  published_date: z.string(),
  tags: z.array(z.string()),
});

// Esquema para la página principal del blog. (Sin cambios)
export const blogPageSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),
  featured_title: z.string(),
  all_posts_title: z.string(),
  read_more_cta: z.string(),
});

// --- INICIO DE LA CORRECCIÓN ARQUITECTÓNICA ---
// Se añade 'content' para que el esquema represente la totalidad de los datos del post.
export const postWithSlugSchema = z.object({
  slug: z.string(),
  metadata: blogPostSchema,
  content: z.string(),
});
// --- FIN DE LA CORRECCIÓN ARQUITECTÓNICA ---

// Tipos inferidos. 'PostWithSlug' ahora incluirá la propiedad 'content' automáticamente.
export type BlogPost = z.infer<typeof blogPostSchema>;
export type PostWithSlug = z.infer<typeof postWithSlugSchema>;
