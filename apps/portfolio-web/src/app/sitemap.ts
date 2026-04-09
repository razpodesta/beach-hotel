/**
 * @file apps/portfolio-web/src/app/sitemap.ts
 * @description Orquestador Soberano del Mapa del Sitio (The SEO Sentinel).
 *              Refactorizado: Erradicación de variables no utilizadas y 
 *              cumplimiento estricto del estándar de higiene (Pilar X).
 *              Sincronizado: Soporte nativo para Alternates (Hreflang) y Silo A.
 * @version 9.1 - Linter Pure & SEO Elite Standard
 * @author Staff Engineer - MetaShark Tech
 */

import type { MetadataRoute } from 'next';
import { i18n } from '../config/i18n.config';
import { getAllPosts } from '../lib/blog-api';

/**
 * MATRIZ DE PRIORIDADES (SEO Weighting)
 * @pilar I: Intención de Búsqueda.
 */
const PRIORITY_MAP = {
  home: 1.0,
  paquetes: 0.9,
  blog_index: 0.8,
  blog_post: 0.7,
  legal: 0.5,
  default: 0.6
} as const;

interface SitemapEntry {
  slug: string;
  type: keyof typeof PRIORITY_MAP | 'default';
  lastModified?: string | Date;
}

/**
 * APARATO PRINCIPAL: sitemap
 * @description Genera un índice exhaustivo de rumbos para el ecosistema.
 * @pilar VIII: Resiliencia de Build - Fallback determinista si el clúster falla.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com').replace(/\/$/, '');

  // 1. DEFINICIÓN DE RUTAS ESTÁTICAS (The Foundation)
  const staticRoutes: SitemapEntry[] = [
    { slug: '', type: 'home' },
    { slug: '/paquetes', type: 'paquetes' },
    { slug: '/quienes-somos', type: 'default' },
    { slug: '/mision-y-vision', type: 'default' },
    { slug: '/contacto', type: 'default' },
    { slug: '/blog', type: 'blog_index' },
    { slug: '/legal/politica-de-privacidad', type: 'legal' },
    { slug: '/legal/terminos-de-servicio', type: 'legal' },
  ];

  // 2. RECUPERACIÓN DE RUTAS DINÁMICAS (The Journal)
  let blogEntries: SitemapEntry[] = [];
  
  try {
    /** 
     * @note getAllPosts implementa el patrón 'Isolated Synthesis'. 
     * Durante el build servirá Mocks para asegurar un sitemap 
     * funcional sin requerir base de datos activa.
     */
    const posts = await getAllPosts();
    if (Array.isArray(posts)) {
      blogEntries = posts.map(post => ({
        slug: `/blog/${post.slug}`,
        type: 'blog_post',
        lastModified: post.metadata.published_date
      }));
    }
  } catch {
    /**
     * @fix: Optional Catch Binding para erradicar variable 'err' no utilizada.
     */
    console.warn('[HEIMDALL][SEO] Fallo en la sincronización de posts para sitemap. Utilizando base estática.');
  }

  const allEntries = [...staticRoutes, ...blogEntries];

  // 3. ORQUESTACIÓN DE MAPEO GEOGRÁFICO (The Globalization Loop)
  return allEntries.flatMap((entry) =>
    i18n.locales.map((locale) => {
      /**
       * @fix: Eliminación de 'isDefault' no utilizada para satisfacer al compilador.
       */
      
      /**
       * CONSTRUCCIÓN DE RUMBO SEGURO
       * Erradica el error de doble barra 'locale//slug'
       */
      const cleanSlug = entry.slug.startsWith('/') ? entry.slug : `/${entry.slug}`;
      const path = cleanSlug === '/' ? `/${locale}` : `/${locale}${cleanSlug}`;
      const url = `${baseUrl}${path.replace(/\/$/, '')}`;

      return {
        url,
        lastModified: entry.lastModified ? new Date(entry.lastModified) : new Date(),
        changeFrequency: entry.type === 'blog_post' ? 'weekly' : 'daily',
        priority: PRIORITY_MAP[entry.type as keyof typeof PRIORITY_MAP] || PRIORITY_MAP.default,
        /**
         * @property alternates
         * @description Sincronización nativa de hreflang para SEO internacional.
         */
        languages: i18n.locales.reduce((acc, loc) => {
          const locPath = cleanSlug === '/' ? `/${loc}` : `/${loc}${cleanSlug}`;
          return {
            ...acc,
            [loc]: `${baseUrl}${locPath.replace(/\/$/, '')}`
          };
        }, {}),
      };
    })
  ) as MetadataRoute.Sitemap;
}