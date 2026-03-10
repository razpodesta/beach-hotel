// RUTA: apps/portfolio-web/src/data/mocks/cms.mocks.ts
// VERSIÓN: 6.0 - Dominio de Hospitalidad & Vida Nocturna (Raw GraphQL Shape)
// DESCRIPCIÓN: Datos simulados de alta fidelidad alineados con el Beach Hotel Canasvieiras 
//              y el festival Pride Escape 2026. Mantiene la estructura CRUDA para el adaptador.

import type { UserGamificationProfile, Artifact } from '../../lib/gamification/types';

// NOTA TÉCNICA:
// Exportamos los posts con la estructura "cruda" (Raw) que vendría de la base de datos/GraphQL.
// El archivo 'lib/blog/actions.ts' se encarga de transformar esto al tipo 'PostWithSlug'.

export const MOCK_POSTS =[
  {
    slug: 'guia-vida-nocturna-floripa',
    title: "La Guía Definitiva de Vida Nocturna en Floripa",
    description: "Descubre los clubes más exclusivos, las fiestas en barco y los secretos mejor guardados para vivir la noche en Florianópolis al máximo.",
    author: { username: "Concierge Team" },
    published_date: "2026-01-15",
    tags:[
      { name: "Nightlife", slug: "nightlife" },
      { name: "VIP Experience", slug: "vip-experience" }
    ],
    content: `
## El Pulso de la Isla de la Magia

Florianópolis no solo es famosa por sus 42 playas; es el epicentro indiscutible de la vida nocturna premium en el sur de Brasil. Desde los exclusivos *beach clubs* en Jurerê Internacional hasta las vibrantes pistas de baile en el centro, la isla ofrece una experiencia magnética.

### 1. Beach Clubs y Sunsets

La fiesta en Floripa empieza antes de que caiga el sol. Los clubes de playa ofrecen camas balinesas, coctelería de autor y DJs internacionales. 
* **Tip del Concierge:** Reserva con al menos una semana de anticipación durante temporada alta. Nuestros huéspedes en el Beach Hotel tienen prioridad en las listas de acceso.

### 2. The Boat Party Experience

No puedes decir que viviste Floripa si no has estado en una *Boat Party*. Navegar por la Baía Norte con un sistema de sonido de alta fidelidad, open bar premium y el atardecer cayendo sobre el puente Hercílio Luz es una experiencia transformadora.

> "La verdadera magia de la isla ocurre donde el mar se encuentra con los neones."

### Conclusión

Tu estadía en Canasvieiras te sitúa estratégicamente a minutos de los mejores spots. Pregunta en nuestra recepción por los *transfers* privados y pulseras VIP.
    `
  },
  {
    slug: 'secretos-de-canasvieiras',
    title: "Secretos de Canasvieiras: El Refugio Boutique",
    description: "Más allá de las playas concurridas, Canasvieiras esconde rincones de paz, alta gastronomía y vistas al mar inolvidables.",
    author: { username: "Concierge Team" },
    published_date: "2026-02-02",
    tags:[
      { name: "Lifestyle", slug: "lifestyle" },
      { name: "Gastronomía", slug: "gastronomia" }
    ],
    content: `
## El Nuevo Rostro de Canasvieiras

Tradicionalmente conocida como el destino favorito del cono sur, Canasvieiras está experimentando un renacimiento. Hoy, el barrio fusiona su encanto clásico con una nueva ola de hospitalidad boutique y gastronomía de autor.

### Gastronomía Frente al Mar

Olvídate de los menús turísticos tradicionales. La nueva propuesta culinaria del norte de la isla incluye:
* **Ostras Frescas:** Cultivadas localmente en Ribeirão da Ilha, servidas directamente en los lounges frente al mar.
* **Coctelería Botánica:** Mixólogos locales están utilizando flora nativa para crear tragos que capturan la esencia de Santa Catarina.

## Tu Santuario Privado

Después de un día explorando o una noche intensa, el regreso debe ser perfecto. En el **Beach Hotel Canasvieiras**, hemos diseñado nuestras suites con aislamiento acústico de grado estudio, sábanas de hilo egipcio y balcones privados. 

### El Equilibrio Perfecto

Canasvieiras te ofrece la dualidad definitiva: la energía vibrante en sus calles principales y la tranquilidad absoluta dentro de las puertas de nuestro hotel.
    `
  },
  {
    slug: 'pride-escape-2026-guia',
    title: "Pride Escape 2026: Todo lo que Necesitas Saber",
    description: "Prepárate para la mayor toma boutique del invierno en Brasil. 7 días de takeover, comunidad y lujo ininterrumpido.",
    author: { username: "Event Director" },
    published_date: "2026-03-10",
    tags:[
      { name: "Festival", slug: "festival" },
      { name: "Eventos", slug: "eventos" }
    ],
    content: `
## The Winter Escape

¿Quién dijo que el invierno es para quedarse en casa? El **Canasvieiras Fest: Pride Escape 2026** llega para monopolizar la ocupación hotelera y elevar la temperatura del sur de Brasil. 

### ¿Qué esperar del Takeover?

Durante 7 días, el Beach Hotel Canasvieiras se convierte en el "Headquarters" (Cuartel General) exclusivo del evento.
* **Pool Parties Diarias:** DJs residentes e invitados especiales desde las 14:00 hrs.
* **Comunidad Global:** Conecta con visitantes de Argentina, Chile, Uruguay y todo Brasil en un ambiente seguro y vibrante.
* **Logística Cero Fricción:** Como huésped del hotel, los *shuttles* a las fiestas externas (Praia Mole, Centro) salen directamente desde nuestro lobby.

### Acceso VIP

El paquete *Master Suite* no solo te asegura el mejor descanso, sino que incluye *All-Access* a los backstages de las 4 fiestas principales del festival y un Welcome Kit de edición limitada.

Reserva con antelación, el paraíso te espera.
    `
  }
];

// --- PERFIL DE GAMIFICACIÓN MOCK ---
// Mantenemos la estructura técnica para no romper los tipos de @razpodesta/protocol-33
// hasta que abordemos la purga/adaptación de la Gamificación.
export const MOCK_PROFILE: UserGamificationProfile = {
  level: 5,
  currentXp: 450,
  nextLevelXp: 800,
  progressPercent: 56.25,
  inventory:[
    {
      id: 'mock-item-1',
      acquiredAt: new Date().toISOString(),
      isEquipped: true,
      artifact: {
        id: 'pato-goma-dorado',
        slug: 'pato-goma-dorado',
        name: 'El Pato de Goma Dorado',
        description: 'El consejero silencioso que resuelve todos los bugs.',
        house: 'ANOMALIES',
        rarity: 'COMMON',
        baseValue: 20
      }
    }
  ]
};

// --- CÓDICE MOCK ---
export const MOCK_CODEX: Artifact[] =[
    MOCK_PROFILE.inventory[0].artifact
];