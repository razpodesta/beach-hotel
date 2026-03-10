// RUTA: apps/portfolio-web/src/lib/schemas/hero.schema.ts
// VERSIÓN: 5.0 - Contrato Definitivo para 9 Arquetipos de Proyecto.
// DESCRIPCIÓN: Esta es la fuente de verdad final para la estructura de contenido del
//              Hero Carousel. Define explícitamente las claves para los 9 slides,
//              incluyendo "Fashion Wear", garantizando la sincronización con el contenido.

import { z } from 'zod';

export const heroSchema = z.object({
  page_title: z.string(),
  page_description: z.string(),

  // Arquetipo 1: Landing Pages
  LANDINGS_SUBTITLE: z.string(),
  LANDINGS_TITLE: z.string(),
  LANDINGS_FEATURES: z.string(),

  // Arquetipo 2: E-commerce
  ECOMMERCE_SUBTITLE: z.string(),
  ECOMMERCE_TITLE: z.string(),
  ECOMMERCE_FEATURES: z.string(),

  // Arquetipo 3: Showrooms Corporativos
  SHOWROOMS_SUBTITLE: z.string(),
  SHOWROOMS_TITLE: z.string(),
  SHOWROOMS_FEATURES: z.string(),

  // Arquetipo 4: Hotelería
  HOTELS_SUBTITLE: z.string(),
  HOTELS_TITLE: z.string(),
  HOTELS_FEATURES: z.string(),

  // Arquetipo 5: Comunidades Online
  COMMUNITIES_SUBTITLE: z.string(),
  COMMUNITIES_TITLE: z.string(),
  COMMUNITIES_FEATURES: z.string(),

  // Arquetipo 6: ONGs
  NGO_SUBTITLE: z.string(),
  NGO_TITLE: z.string(),
  NGO_FEATURES: z.string(),

  // Arquetipo 7: Portafolios Creativos
  PORTFOLIOS_SUBTITLE: z.string(),
  PORTFOLIOS_TITLE: z.string(),
  PORTFOLIOS_FEATURES: z.string(),

  // Arquetipo 8: Revistas Digitales
  MAGAZINES_SUBTITLE: z.string(),
  MAGAZINES_TITLE: z.string(),
  MAGAZINES_FEATURES: z.string(),

  // Arquetipo 9: Fashion Wear
  FASHION_SUBTITLE: z.string(),
  FASHION_TITLE: z.string(),
  FASHION_FEATURES: z.string(),

  CTA_BUTTON: z.string(),
});
