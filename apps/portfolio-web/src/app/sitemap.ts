/**
 * @file apps/portfolio-web/src/app/sitemap.ts
 * @description Generador soberano del mapa del sitio (Sitemap). 
 *              Garantiza la indexación SEO de todos los activos localizados, 
 *              optimizando la prioridad de rastreo para el Hotel y el Festival.
 * @version 3.1
 * @author Raz Podestá - MetaShark Tech
 */

import type { MetadataRoute } from 'next';
// CUMPLIMIENTO @nx/enforce-module-boundaries: Uso de ruta relativa interna
import { i18n } from '../config/i18n.config';

/**
 * Orquestador de Sitemap Next.js 15.
 * @returns {MetadataRoute.Sitemap} Colección de URLs canónicas con metadatos de rastreo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beachhotelcanasvieiras.com';

  /**
   * INVENTARIO DE RUTAS PÚBLICAS (Sincronizado con la estructura física del proyecto).
   */
  const publicRoutes = [
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
   * Generación de Matriz Localizada.
   * Transforma cada ruta lógica en una entrada física por cada idioma soportado.
   */
  const routes: MetadataRoute.Sitemap = publicRoutes.flatMap((route) =>
    i18n.locales.map((locale) => {
      const isHome = route === '';
      const isCritical = route === '/festival' || route === '/blog';
      
      /**
       * CORRECCIÓN TS2322: Se utiliza un casting explícito a los tipos literales
       * requeridos por MetadataRoute.Sitemap para evitar la inferencia como 'string'.
       */
      const changeFrequency: 'daily' | 'weekly' = isHome ? 'daily' : 'weekly';
      
      return {
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency,
        priority: isHome ? 1.0 : isCritical ? 0.9 : 0.7,
      };
    })
  );

  return routes;
}