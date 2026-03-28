/**
 * @file apps/portfolio-web/src/app/robots.ts
 * @description Orquestador Soberano de Indexación (The Sentinel).
 *              Controla el acceso de rastreadores al ecosistema MetaShark.
 * @version 2.0 - Dynamic SEO Compliance
 * @author Raz Podestá - MetaShark Tech
 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beach-hotel.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',      // Protegemos las rutas de telemetría y geolocalización
        '/admin/',    // Protegemos el panel de acceso al CMS
        '/_payload/', // Protegemos el motor interno de datos
        '/*?*',       // Evitamos indexar URLs con parámetros de búsqueda (filtros de suites)
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}