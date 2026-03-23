/**
 * @file cms.mocks.ts
 * @description Fuente estática de verdad para datos simulados del ecosistema.
 *              Nivelado: Sincronización absoluta con el contrato RawPayloadPost 
 *              y el Shaper Polimórfico de actions.ts.
 *              Actúa como payload fuente para el script de Seeding de base de datos.
 * @version 8.0 - Full Author & Media Integration
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @description Colección de artículos editoriales para el Concierge Journal.
 * Simula la respuesta cruda de Payload CMS 3.0 para validar el pipeline i18n.
 */
export const MOCK_POSTS = [
  {
    slug: 'guia-vida-nocturna-floripa',
    title: "The Ultimate Guide to Floripa Nightlife",
    description: "Discover the most exclusive clubs, boat parties, and best-kept secrets of the Island of Magic.",
    publishedDate: "2026-01-15T12:00:00.000Z",
    author: { 
      username: "Raz Podestá",
      email: "contact@metashark.tech" 
    },
    tags: [
      { tag: "Nightlife" },
      { tag: "VIP Experience" }
    ],
    // Simulación de objeto Media de Payload
    ogImage: {
      url: "/images/blog/guia-vida-nocturna-floripa.jpg"
    },
    content: "## The Pulse of the Island\n\nFlorianópolis is known worldwide for its beaches, but when the sun goes down, the real magic begins. From private yacht parties in Jurerê to underground clubs in the Center, this is your sanctuary of information."
  },
  {
    slug: 'secretos-de-canasvieiras',
    title: "Canasvieiras Secrets: The Boutique Escape",
    description: "Beyond the crowded beaches, Canasvieiras hides corners of peace and elite hospitality.",
    publishedDate: "2026-02-02T10:30:00.000Z",
    author: { 
      username: "Concierge Team" 
    },
    tags: [
      { tag: "Lifestyle" },
      { tag: "Gastronomy" }
    ],
    ogImage: {
      url: "/images/blog/secretos-de-canasvieiras.jpg"
    },
    content: "## The New Face of the North\n\nHidden in plain sight, the northern district has evolved. What used to be a mass tourism destination now hosts the most advanced hospitality infrastructure in Santa Catarina."
  },
  {
    slug: 'pride-escape-2026-guia',
    title: "Pride Escape 2026: Official Takeover Guide",
    description: "Get ready for the largest boutique winter takeover in Brazil. 7 days of absolute freedom.",
    publishedDate: "2026-03-10T18:45:00.000Z",
    author: { 
      username: "MetaShark Tech" 
    },
    tags: [
      { tag: "Festival" },
      { tag: "Events" }
    ],
    ogImage: {
      url: "/images/blog/pride-escape-2026-guia.jpg"
    },
    content: "## The Winter Escape\n\nCold doesn't exist when the community takes control. 7 days of events, private yachts, and uninterrupted VIP access. This isn't just a festival; it's a statement of intent."
  }
] as const;

/**
 * @description Colección de activos digitales y proyectos de infraestructura.
 * Sincronizado con el esquema ProjectEntity para validación de reputación (P33).
 */
export const MOCK_PROJECTS = [
  {
    slug: 'oh-hostels-platform',
    title: 'Oh! Hostels Digital Hub',
    description: 'Elite web platform for a hotel chain, featuring a reservation system and advanced SEO optimization.',
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
      body: 'We transformed a generic booking process into a high-fidelity user experience, increasing direct conversions by 40%.'
    },
    elite_options: [
      { name: 'Sovereign Engine', detail: 'Decoupled CMS with GraphQL architecture.' },
      { name: 'Edge Deployment', detail: 'Distributed global static rendering for zero latency.' }
    ],
    status: 'published',
    tenantId: '00000000-0000-0000-0000-000000000001'
  },
  {
    slug: 'meta-shark-ecosystem',
    title: 'MetaShark Core Infrastructure',
    description: 'Hyper-scalable monorepo housing the intelligence and orchestration of complex systems.',
    imageUrl: '/images/projects/metashark.jpg',
    liveUrl: '#',
    codeUrl: 'https://github.com/razpodesta/metashark-core',
    tags: ['Architecture', 'SaaS'],
    tech_stack: ['Nx Monorepo', 'NestJS', 'PostgreSQL', 'Docker'],
    reputationWeight: 100,
    branding: { 
      primary_color: '#a855f7', 
      layout_style: 'minimal' 
    },
    introduction: {
      heading: 'The Digital Brain',
      body: 'The architectural foundation designed to support high concurrency loads with minimal latency, ensuring zero regressions.'
    },
    elite_options: [
      { name: 'Microservices', detail: 'Atomic and resilient architecture.' },
      { name: 'Protocol Heimdall', detail: 'Military-grade observability and traceability.' }
    ],
    status: 'published',
    tenantId: '00000000-0000-0000-0000-000000000001'
  }
] as const;