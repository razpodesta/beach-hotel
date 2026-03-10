// RUTA: apps/portfolio-web/src/app/sitemap.ts
// VERSIÓN: 2.0 - Generador de Sitemap Completo.
// DESCRIPCIÓN: Se añaden las nuevas rutas canónicas al array `publicRoutes` para
//              garantizar que sean incluidas en el sitemap.xml generado.

import { i18n } from '@/config/i18n.config';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';

  const publicRoutes = [
    '', // La página de inicio
    '/quien-soy',
    '/mision-y-vision',
    '/contacto',
    '/blog',
    '/sistema-de-diseno',
    '/cocreacion', // <-- RUTA AÑADIDA
    '/legal/politica-de-privacidad', // <-- RUTA AÑADIDA
    '/legal/terminos-de-servicio', // <-- RUTA AÑADIDA
  ];

  const routes = publicRoutes.flatMap((route) =>
    i18n.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date().toISOString(),
    }))
  );

  return routes;
}
