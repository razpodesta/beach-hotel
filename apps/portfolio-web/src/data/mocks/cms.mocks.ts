// RUTA: apps/portfolio-web/src/data/mocks/cms.mocks.ts
// VERSIÓN: 6.1 - Estructura alineada con GraphQL Payload CMS 3.0
// DESCRIPCIÓN: Datos simulados ajustados para satisfacer el adaptador `mapPayloadToPost`.

export const MOCK_POSTS = [
  {
    slug: 'guia-vida-nocturna-floripa',
    title: "La Guía Definitiva de Vida Nocturna en Floripa",
    description: "Descubre los clubes más exclusivos, las fiestas en barco y los secretos mejor guardados.",
    author: { username: "Concierge Team" },
    publishedDate: "2026-01-15", // Renombrado para coincidir con GraphQL
    tags: [
      { tag: "Nightlife" },    // Estructura simplificada para el adaptador
      { tag: "VIP Experience" }
    ],
    content: "## El Pulso de la Isla de la Magia..."
  },
  {
    slug: 'secretos-de-canasvieiras',
    title: "Secretos de Canasvieiras: El Refugio Boutique",
    description: "Más allá de las playas concurridas, Canasvieiras esconde rincones de paz.",
    author: { username: "Concierge Team" },
    publishedDate: "2026-02-02",
    tags: [
      { tag: "Lifestyle" },
      { tag: "Gastronomía" }
    ],
    content: "## El Nuevo Rostro de Canasvieiras..."
  },
  {
    slug: 'pride-escape-2026-guia',
    title: "Pride Escape 2026: Todo lo que Necesitas Saber",
    description: "Prepárate para la mayor toma boutique del invierno en Brasil.",
    author: { username: "Event Director" },
    publishedDate: "2026-03-10",
    tags: [
      { tag: "Festival" },
      { tag: "Eventos" }
    ],
    content: "## The Winter Escape..."
  }
] as const;

/**
 * Nota: Los datos de gamificación (MOCK_PROFILE y MOCK_CODEX) deben ser 
 * movidos a una nueva ubicación dentro del paquete @razpodesta/protocol-33 
 * durante la Fase 4 para cumplir con la arquitectura de librerías soberanas.
 */