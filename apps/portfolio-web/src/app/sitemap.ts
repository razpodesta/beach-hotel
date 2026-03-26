/**
 * @file apps/portfolio-web/src/app/sitemap.ts
 * @description Generador soberano del mapa del sitio (Sitemap). 
 *              Implementa orquestación híbrida (Estático + CMS Dinámico) para 
 *              garantizar indexación total de activos localizados.
 * @version 4.0 - Dynamic CMS Integration & ESM Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import type { MetadataRoute } from 'next';
/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Consistencia ESM mediante extensiones .js
 */
import { i18n } from '../config/i18n.config.js';
import { getAllPosts } from '../lib/blog-api.js';

/**
 * Orquestador de Sitemap Next.js 15 (Asíncrono).
 * @returns {Promise<MetadataRoute.Sitemap>} Matriz completa de URLs canónicas.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  /**
   * 1. INVENTARIO DE RUTAS ESTÁTICAS
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
   * @pilar VIII: Resiliencia. Obtenemos los artículos de la Fachada de Dominio.
   */
  let blogSlugs: string[] = [];
  try {
    const posts = await getAllPosts();
    blogSlugs = posts.map(post => `/blog/${post.slug}`);
  } catch (error) {
    console.error('[HEIMDALL][SITEMAP] Fallo al recuperar rutas dinámicas:', error);
  }

  const allLogicalRoutes = [...staticRoutes, ...blogSlugs];

  /**
   * 3. GENERACIÓN DE MATRIZ LOCALIZADA
   * Transforma rumbos lógicos en URLs físicas para cada locale.
   */
  const sitemapEntries: MetadataRoute.Sitemap = allLogicalRoutes.flatMap((route) =>
    i18n.locales.map((locale) => {
      const isHome = route === '';
      const isCritical = route === '/festival' || route.startsWith('/blog/');
      const isLegal = route.startsWith('/legal/');

      // Cálculo de Prioridad Estratégica
      let priority = 0.7;
      if (isHome) priority = 1.0;
      else if (route === '/festival') priority = 0.9;
      else if (isCritical) priority = 0.8;
      else if (isLegal) priority = 0.5;

      // Determinación de Frecuencia de Rastreo
      const changeFrequency: 'daily' | 'weekly' | 'monthly' = isHome || isCritical 
        ? 'daily' 
        : isLegal ? 'monthly' : 'weekly';

      return {
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency,
        priority,
      };
    })
  );

  return sitemapEntries;
}