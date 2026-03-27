/**
 * @file apps/portfolio-web/src/app/sitemap.ts
 * @description Generador soberano del mapa del sitio (Sitemap). 
 *              Implementa orquestación híbrida, resolución de rutas nativa
 *              y SEO de alta fidelidad para el ecosistema MetaShark.
 * @version 5.0 - Vercel Build Sync & Freshness Signal Optimization
 * @author Raz Podestá - MetaShark Tech
 */

import type { MetadataRoute } from 'next';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Rutas Saneadas)
 * @pilar V: Adherencia arquitectónica. Eliminación de extensiones .js para 
 * resolución nativa en el pipeline de Next.js 15.
 */
import { i18n } from '../config/i18n.config';
import { getAllPosts } from '../lib/blog-api';

/**
 * ORQUESTADOR DE SITEMAP: sitemap
 * @description Genera la matriz de indexación para motores de búsqueda.
 * @returns {Promise<MetadataRoute.Sitemap>} Matriz de URLs canónicas.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * RESOLUCIÓN DE ORIGEN SOBERANO
   * @pilar VIII: Resiliencia de entorno.
   */
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://beachhotelcanasvieiras.com');

  /**
   * 1. INVENTARIO DE RUTAS ESTÁTICAS
   * Definición inmutable de los rumbos base del Hotel y Festival.
   */
  const staticRoutes = [
    '',               // Landing Page (Recepção)
    '/festival',      // The Winter Escape 2026
    '/quienes-somos', // Historia y Legado
    '/mision-y-vision',
    '/contacto',      // Concierge Desk
    '/blog',          // The Concierge Journal
    '/legal/politica-de-privacidad',
    '/legal/terminos-de-servicio',
  ];

  /**
   * 2. INVENTARIO DE RUTAS DINÁMICAS (CMS)
   * @description Recupera artículos del dominio editorial con fallback resiliente.
   */
  let blogEntries: Array<{ slug: string, lastMod: string }> = [];
  
  try {
    const posts = await getAllPosts();
    blogEntries = posts.map(post => ({
      slug: `/blog/${post.slug}`,
      lastMod: post.metadata.published_date
    }));
  } catch (error) {
    console.error('[HEIMDALL][SITEMAP] Fallo al recuperar rutas dinámicas. Operando en modo degradado.');
  }

  // 3. ENSAMBLAJE DE RUTAS LÓGICAS
  const staticLogical = staticRoutes.map(route => ({ slug: route, lastMod: new Date().toISOString() }));
  const allLogicalRoutes = [...staticLogical, ...blogEntries];

  /**
   * 4. GENERACIÓN DE MATRIZ LOCALIZADA
   * Transforma rumbos lógicos en rumbos físicos SEO-Friendly.
   */
  console.log(`[HEIMDALL][SEO] Generating Sitemap for ${allLogicalRoutes.length} logical routes across ${i18n.locales.length} locales.`);

  const sitemapEntries: MetadataRoute.Sitemap = allLogicalRoutes.flatMap((route) =>
    i18n.locales.map((locale) => {
      const isHome = route.slug === '';
      const isCritical = route.slug === '/festival' || route.slug.startsWith('/blog/');
      const isLegal = route.slug.startsWith('/legal/');

      // Cálculo de Prioridad Estratégica
      let priority = 0.7;
      if (isHome) priority = 1.0;
      else if (route.slug === '/festival') priority = 0.9;
      else if (isCritical) priority = 0.8;
      else if (isLegal) priority = 0.5;

      // Determinación de Frecuencia de Rastreo
      const changeFrequency: 'daily' | 'weekly' | 'monthly' = (isHome || isCritical)
        ? 'daily' 
        : (isLegal ? 'monthly' : 'weekly');

      return {
        url: `${baseUrl}/${locale}${route.slug}`,
        lastModified: route.lastMod,
        changeFrequency,
        priority,
      };
    })
  );

  return sitemapEntries;
}