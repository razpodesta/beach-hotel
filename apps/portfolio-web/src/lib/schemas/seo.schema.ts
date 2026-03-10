// RUTA: oh-hoteis/src/lib/schemas/seo.schema.ts
// VERSIÓN: Definitiva de Producción. Pura, enriquecida y arquitectónicamente correcta.

/**
 * ===================================================================================
 * FUENTE DE VERDAD PARA DATOS ESTRUCTURADOS (SCHEMA.ORG)
 * ===================================================================================
 *
 * VISIÓN ULTRAHOLÍSTICA:
 * Este archivo es un pilar central de nuestra estrategia de SEO técnico avanzado.
 * Define, utilizando Zod, los "contratos" inmutables para todos los datos
 * estructurados que se inyectarán en el sitio. Al centralizar estas definiciones,
 * garantizamos consistencia, validación automática y una seguridad de tipos
 * de extremo a extremo, desde la capa de datos hasta el renderizado final a través
 * del componente `JsonLdScript`.
 *
 * Los esquemas han sido enriquecidos más allá del mínimo requerido, anticipando
 * las necesidades futuras de las páginas de detalle de los hoteles y fortaleciendo
 * la entidad de la organización a los ojos de los motores de búsqueda.
 *
 * ===================================================================================
 */

import { z } from 'zod';

// Esquema para la Organización (usado en la página de inicio y potencialmente en el footer).
// Enriquece la entidad de la marca para Google.
export const organizationSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('Organization'),
  name: z.string(),
  url: z.string().url(),
  logo: z.string().url(),
  contactPoint: z.object({
    '@type': z.literal('ContactPoint'),
    telephone: z.string(),
    contactType: z.string(),
  }),
});

// Esquema para un Hotel (diseñado para las futuras páginas de detalle de cada hotel).
export const hotelSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('Hotel'),
  name: z.string(),
  description: z.string(),
  image: z.array(z.string().url()),
  address: z.object({
    '@type': z.literal('PostalAddress'),
    streetAddress: z.string(),
    addressLocality: z.string(),
    addressRegion: z.string(),
    postalCode: z.string(),
    addressCountry: z.string(),
  }),
  // Se pueden añadir más propiedades como 'starRating', 'priceRange', 'checkinTime', etc.
});

// Tipos inferidos de TypeScript para ser utilizados en toda la aplicación.
// Esto cumple con nuestra regla de oro: "Esquema Primero, Tipo Después".
export type OrganizationSchema = z.infer<typeof organizationSchema>;
export type HotelSchema = z.infer<typeof hotelSchema>;
