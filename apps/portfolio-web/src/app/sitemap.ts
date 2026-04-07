/**
 * @file apps/portfolio-web/src/app/sitemap.ts
 * @description Generador soberano del mapa del sitio (Sitemap Engine).
 *              Refactorizado: Erradicación de 'unstable_noStore' durante el build,
 *              normalización de rutas absoluta y blindaje de ejecución determinista.
 * @version 8.4 - Build-Safe Deterministic Standard
 * @author Raz Podestá - MetaShark Tech
 */

import type { MetadataRoute } from 'next';
import { i18n } from '../config/i18n.config';
import { getAllPosts } from '../lib/blog-api';

const PRIORITY_MAP: Record<string, number> = {
  home: 1.0,
  festival: 0.9,
  blog: 0.8,
  legal: 0.5,
  default: 0.7
};

interface SitemapRoute {
  slug: string;
  type: string;
  lastModified?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  const staticRoutes: SitemapRoute[] = [
    { slug: '', type: 'home' },
    { slug: '/festival', type: 'festival' },
    { slug: '/quienes-somos', type: 'default' },
    { slug: '/mision-y-vision', type: 'default' },
    { slug: '/contacto', type: 'default' },
    { slug: '/blog', type: 'blog' },
    { slug: '/subscribe', type: 'default' },
    { slug: '/legal/politica-de-privacidad', type: 'legal' },
    { slug: '/legal/terminos-de-servicio', type: 'legal' },
  ];

  let blogEntries: SitemapRoute[] = [];
  
  try {
    // La función getAllPosts ya tiene protección contra el entorno de build (IS_BUILD_ENV)
    // Esto asegura que devuelva Mocks y no intente conectar a DB durante la compilación.
    const posts = await getAllPosts();
    if (Array.isArray(posts)) {
      blogEntries = posts
        .filter(post => post && post.slug)
        .map(post => ({
          slug: `/blog/${post.slug}`,
          type: 'blog',
          lastModified: post.metadata?.published_date || new Date().toISOString()
        }));
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown sync failure';
    console.warn(`[HEIMDALL][SITEMAP] Editorial sync skipped during build: ${errorMessage}.`);
  }

  // Generación determinista sin depender de cookies o estados de servidor
  return [...staticRoutes, ...blogEntries].flatMap((route) =>
    i18n.locales.map((locale) => {
      const cleanSlug = route.slug.startsWith('/') ? route.slug : `/${route.slug}`;
      const url = `${baseUrl}/${locale}${cleanSlug}`.replace(/([^:]\/)\/+/g, "$1");
      
      return {
        url,
        lastModified: route.lastModified ? new Date(route.lastModified).toISOString() : new Date().toISOString(),
        changeFrequency: 'daily',
        priority: PRIORITY_MAP[route.type] ?? PRIORITY_MAP.default,
      };
    })
  );
}