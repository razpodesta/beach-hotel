/**
 * @file apps/portfolio-web/src/data/mocks/cms.mocks.ts
 * @description Fuente estática de verdad para datos simulados del ecosistema.
 *              Tipada y estructurada para alinearse con los esquemas de Payload CMS 3.0.
 *              Actúa como payload fuente para el script de Seeding de base de datos.
 * @version 7.0 - Seed Payload Ready
 * @author Raz Podestá - MetaShark Tech
 */

export const MOCK_POSTS =[
  {
    slug: 'guia-vida-nocturna-floripa',
    title: "La Guía Definitiva de Vida Nocturna en Floripa",
    description: "Descubre los clubes más exclusivos, las fiestas en barco y los secretos mejor guardados.",
    publishedDate: "2026-01-15T12:00:00.000Z",
    tags:[
      { tag: "Nightlife" },
      { tag: "VIP Experience" }
    ],
    content: "## El Pulso de la Isla de la Magia\n\nFlorianópolis es mundialmente conocida por sus playas, pero cuando el sol se pone, la verdadera magia de la isla cobra vida. Desde fiestas exclusivas en barcos hasta los clubes subterráneos más vibrantes, esta es la guía definitiva."
  },
  {
    slug: 'secretos-de-canasvieiras',
    title: "Secretos de Canasvieiras: El Refugio Boutique",
    description: "Más allá de las playas concurridas, Canasvieiras esconde rincones de paz.",
    publishedDate: "2026-02-02T10:30:00.000Z",
    tags:[
      { tag: "Lifestyle" },
      { tag: "Gastronomía" }
    ],
    content: "## El Nuevo Rostro de Canasvieiras\n\nOculto a plena vista, el distrito norte ha evolucionado. Lo que antes era solo un destino de turismo masivo, ahora alberga la infraestructura de hospitalidad más avanzada de Santa Catarina."
  },
  {
    slug: 'pride-escape-2026-guia',
    title: "Pride Escape 2026: Todo lo que Necesitas Saber",
    description: "Prepárate para la mayor toma boutique del invierno en Brasil.",
    publishedDate: "2026-03-10T18:45:00.000Z",
    tags:[
      { tag: "Festival" },
      { tag: "Eventos" }
    ],
    content: "## The Winter Escape\n\nEl frío no existe cuando la comunidad toma el control. 7 días de eventos, yates privados y acceso VIP ininterrumpido. Este no es un festival; es una declaración de intenciones."
  }
] as const;

export const MOCK_PROJECTS =[
  {
    slug: 'oh-hostels-platform',
    title: 'Oh! Hostels Digital Hub',
    description: 'Plataforma web de élite para cadena hotelera, con sistema de reservas y optimización SEO avanzada.',
    imageUrl: '/images/projects/oh-hostels.jpg',
    liveUrl: 'https://oh-hostels.com',
    codeUrl: null,
    tags:['Hospitality', 'E-commerce'],
    tech_stack:['Next.js 15', 'TypeScript', 'Tailwind v4', 'Payload CMS'],
    reputationWeight: 80,
    branding: { primary_color: '#3b82f6', layout_style: 'editorial' },
    introduction: {
      heading: 'Revolución en Hospitalidad',
      body: 'Transformamos un proceso de reserva genérico en una experiencia de usuario de alta fidelidad, incrementando las conversiones directas en un 40%.'
    },
    elite_options:[
      { name: 'Sovereign Engine', detail: 'CMS Desacoplado con GraphQL.' },
      { name: 'Edge Deployment', detail: 'Renderizado estático global distribuido.' }
    ]
  },
  {
    slug: 'meta-shark-ecosystem',
    title: 'MetaShark Core Infrastructure',
    description: 'Monorepo hiper-escalable que alberga la inteligencia y orquestación de sistemas complejos.',
    imageUrl: '/images/projects/metashark.jpg',
    liveUrl: '#',
    codeUrl: 'https://github.com/razpodesta/metashark-core',
    tags: ['Architecture', 'SaaS'],
    tech_stack:['Nx Monorepo', 'NestJS', 'PostgreSQL', 'Docker'],
    reputationWeight: 100,
    branding: { primary_color: '#a855f7', layout_style: 'minimal' },
    introduction: {
      heading: 'El Cerebro Digital',
      body: 'La fundación arquitectónica diseñada para soportar cargas de alta concurrencia con latencia mínima, garantizando cero regresiones.'
    },
    elite_options:[
      { name: 'Microservicios', detail: 'Arquitectura atómica y resiliente.' },
      { name: 'Protocolo Heimdall', detail: 'Observabilidad y trazabilidad militar.' }
    ]
  }
] as const;