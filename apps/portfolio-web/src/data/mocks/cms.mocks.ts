/**
 * @file apps/portfolio-web/src/data/mocks/cms.mocks.ts
 * @version 10.0 - Enterprise Genesis Data Dataset
 * @description Fuente estática de verdad para datos de siembra.
 *              Refactorizado: Estructura de datos 100% alineada con los contratos Zod
 *              de las colecciones del CMS para garantizar inyección libre de errores.
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

export interface RawMockPost {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  authorName: string;
  tags: string[];
  ogImageLocal: string;
  content: string;
}

export const MOCK_POSTS: RawMockPost[] = [
  {
    slug: 'guia-vida-nocturna-floripa',
    title: "The Ultimate Guide to Floripa Nightlife",
    description: "Discover the most exclusive clubs, boat parties, and best-kept secrets of the Island of Magic.",
    publishedDate: "2026-01-15T12:00:00.000Z",
    authorName: "Raz Podestá",
    tags: ["Nightlife", "VIP Experience", "Florianopolis"],
    ogImageLocal: "/images/blog/guia-vida-nocturna-floripa.jpg",
    content: "Florianópolis is known worldwide for its beaches, but when the sun goes down, the real magic begins."
  },
  {
    slug: 'secretos-de-canasvieiras',
    title: "Canasvieiras Secrets: The Boutique Escape",
    description: "Beyond the crowded beaches, Canasvieiras hides corners of peace and elite hospitality.",
    publishedDate: "2026-02-02T10:30:00.000Z",
    authorName: "Concierge Team",
    tags: ["Lifestyle", "Gastronomy", "Travel"],
    ogImageLocal: "/images/blog/secretos-de-canasvieiras.jpg",
    content: "Hidden in plain sight, the northern district has evolved into a boutique destination."
  },
  {
    slug: 'pride-escape-2026-guia',
    title: "Pride Escape 2026: Official Takeover Guide",
    description: "Get ready for the largest boutique winter takeover in Brazil.",
    publishedDate: "2026-03-10T18:45:00.000Z",
    authorName: "MetaShark Tech",
    tags: ["Festival", "Events", "Pride"],
    ogImageLocal: "/images/blog/pride-escape-2026-guia.jpg",
    content: "Cold doesn't exist when the community takes control. 7 days of absolute freedom."
  }
];

/**
 * @description Proyectos de ingeniería digital.
 * Refactorizado: Estructura exacta requerida por la colección 'Projects'.
 */
export const MOCK_PROJECTS = [
  {
    title: 'Oh! Hostels Digital Hub',
    slug: 'oh-hostels-platform',
    description: 'Elite web platform for a hotel chain.',
    imageUrl: '/images/projects/oh-hostels.jpg',
    liveUrl: 'https://oh-hostels.com',
    codeUrl: null,
    tags: ['Hospitality', 'E-commerce'],
    tech_stack: ['Next.js 15', 'TypeScript', 'Tailwind v4', 'Payload CMS'],
    reputationWeight: 80,
    branding: { 
      primary_color: '#3b82f6', 
      layout_style: 'editorial' 
    },
    introduction: {
      heading: 'Hospitality Revolution',
      body: 'We transformed a generic booking process into a high-fidelity user experience.'
    },
    backend_architecture: {
      title: 'Monolith Core',
      description: 'Resilient booking engine.',
      features: ['Reservation Engine', 'Auth Shield']
    },
    status: 'published'
  },
  {
    title: 'MetaShark Core Infrastructure',
    slug: 'meta-shark-ecosystem',
    description: 'Hyper-scalable monorepo.',
    imageUrl: '/images/projects/metashark.jpg',
    liveUrl: '#',
    codeUrl: 'https://github.com/razpodesta/metashark-core',
    tags: ['Architecture', 'SaaS'],
    tech_stack: ['Nx Monorepo', 'NestJS', 'PostgreSQL'],
    reputationWeight: 100,
    branding: { 
      primary_color: '#a855f7', 
      layout_style: 'minimal' 
    },
    introduction: {
      heading: 'The Digital Brain',
      body: 'The architectural foundation designed to support high concurrency loads.'
    },
    backend_architecture: {
      title: 'Event-Driven Core',
      description: 'Microservices with low latency.',
      features: ['Telemetry Hub', 'Auth Shield', 'Service Discovery']
    },
    status: 'published'
  }
] as const;