/**
 * @file apps/portfolio-web/src/app/sitemap.ts
 * @description Generador soberano del mapa del sitio (Sitemap). 
 *              Refactorizado: Erradicación de anotaciones de tipo redundantes 
 *              y cumplimiento estricto de higiene ESLint.
 * @version 7.1 - Linter Pure Edition
 * @author Raz Podestá - MetaShark Tech
 */

import type { MetadataRoute } from 'next';
import { i18n } from '../config/i18n.config';
import { getAllPosts } from '../lib/blog-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beach-hotel.vercel.app';

  const staticRoutes = [
    '', '/festival', '/quienes-somos', '/mision-y-vision',
    '/contacto', '/blog', '/subscribe',
    '/legal/politica-de-privacidad', '/legal/terminos-de-servicio',
  ];

  let blogEntries: Array<{ slug: string, lastModified: string }> = [];
  
  try {
    const posts = await getAllPosts();
    blogEntries = posts.map(post => ({
      slug: `/blog/${post.slug}`,
      lastModified: post.metadata.published_date
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_SYNC_ERROR';
    console.error(`[HEIMDALL][SITEMAP] Error: ${message}.`);
  }

  const staticLogical = staticRoutes.map(route => ({ 
    slug: route, 
    lastModified: new Date().toISOString() 
  }));
  
  const allLogicalRoutes = [...staticLogical, ...blogEntries];

  return allLogicalRoutes.flatMap((route) =>
    i18n.locales.map((locale) => {
      const isHome = route.slug === '';
      const isFestival = route.slug === '/festival';
      const isBlogContent = route.slug.startsWith('/blog/');
      const isLegal = route.slug.startsWith('/legal/');

      // RESOLUCIÓN ESLINT: Se elimina ': number' ya que se infiere del literal.
      let priority = 0.7;
      if (isHome) priority = 1.0;
      else if (isFestival) priority = 0.9;
      else if (isBlogContent) priority = 0.8;
      else if (isLegal) priority = 0.5;

      const changeFrequency: 'daily' | 'weekly' | 'monthly' = 
        (isHome || isFestival || isBlogContent) ? 'daily' : 'monthly';

      return {
        url: `${baseUrl}/${locale}${route.slug}`,
        lastModified: route.lastModified,
        changeFrequency,
        priority,
      };
    })
  );
}