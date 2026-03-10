// RUTA: apps/portfolio-web/src/data/mocks/cms.mocks.ts
// VERSIÓN: 5.0 - Mocking de Alta Fidelidad (Raw GraphQL Shape)
// DESCRIPCIÓN: Datos simulados que imitan la estructura CRUDA que devuelve la API GraphQL.
//              Incluye contenido MDX rico para simular artículos reales.

import type { UserGamificationProfile, Artifact } from '../../lib/gamification/types';

// NOTA TÉCNICA:
// Exportamos los posts con la estructura "cruda" (Raw) que vendría de la base de datos/GraphQL.
// El archivo 'lib/blog/actions.ts' se encarga de transformar esto al tipo 'PostWithSlug'.
// Esto soluciona el error de "undefined" en los títulos.

export const MOCK_POSTS = [
  {
    slug: 'arquitectura-por-manifiesto',
    title: "Arquitectura por Manifiesto: El Código como Artefacto",
    description: "Un análisis profundo sobre cómo establecer principios arquitectónicos sólidos es la clave para construir software resiliente y escalable a largo plazo.",
    author: { username: "Raz Podestá" },
    published_date: "2025-11-18",
    tags: [
      { name: "Arquitectura", slug: "arquitectura" },
      { name: "Buenas Prácticas", slug: "buenas-practicas" }
    ],
    content: `
## El Problema de la Entropía en el Software

En el desarrollo de software moderno, la entropía es el enemigo silencioso. Sin un conjunto claro de reglas, cualquier base de código tiende al caos. La "Arquitectura por Manifiesto" no es solo una metodología; es una declaración de intenciones.

### ¿Qué es un Manifiesto Técnico?

Un manifiesto no es documentación técnica aburrida. Es un conjunto de leyes inquebrantables que rigen el proyecto. Por ejemplo:

1. **Cero 'any'**: La seguridad de tipos no es negociable.
2. **Atomicidad**: Cada componente debe hacer una sola cosa y hacerla bien.
3. **Soberanía de Datos**: Zod es la única fuente de verdad.

## Implementación en el Mundo Real

Al aplicar estos principios, transformamos el código de ser un pasivo técnico a un activo de negocio. Un codebase bien arquitecturado permite a los nuevos desarrolladores ser productivos desde el día uno y reduce drásticamente la deuda técnica.

> "El código se lee muchas más veces de las que se escribe. Escribe para el lector, no para el compilador."

### Conclusión

Adoptar una arquitectura basada en manifiestos requiere disciplina, pero el retorno de inversión es la tranquilidad de saber que tu sistema puede escalar sin colapsar bajo su propio peso.
    `
  },
  {
    slug: 'filosofia-mobile-first',
    title: "Filosofía Mobile-First: Diseñando para la Realidad",
    description: "Más que una técnica CSS, Mobile-First es una filosofía que garantiza una experiencia de usuario superior y un rendimiento óptimo en todos los dispositivos.",
    author: { username: "Raz Podestá" },
    published_date: "2025-11-10",
    tags: [
      { name: "UX", slug: "ux" },
      { name: "Frontend", slug: "frontend" }
    ],
    content: `
## Más allá de las Media Queries

Cuando hablamos de Mobile-First, muchos piensan simplemente en escribir CSS para pantallas pequeñas primero. Pero la filosofía va mucho más allá. Se trata de **priorización despiadada de contenido**.

### La Restricción como Catalizador Creativo

El espacio limitado de un móvil nos obliga a decidir qué es realmente importante. Si algo no cabe en una pantalla de 320px, ¿es realmente esencial para el usuario?

*   **Rendimiento:** Las redes móviles son inestables. Cargar menos recursos no es opcional.
*   **Interacción:** El dedo no es un cursor. Las áreas de toque deben ser generosas.
*   **Contexto:** El usuario móvil suele estar en movimiento y con prisa.

## Core Web Vitals en Móvil

Google prioriza la indexación móvil por una razón. Un LCP (Largest Contentful Paint) bajo en móvil es la diferencia entre una conversión y un rebote.

### Estrategia de Imágenes

Utilizamos el componente \`next/image\` para servir variantes WebP optimizadas específicamente para el viewport del dispositivo, ahorrando ancho de banda y acelerando la carga inicial.
    `
  },
  {
    slug: 'monorepo-con-nx',
    title: "Escalabilidad Fractal: Monorepo con Nx",
    description: "Explora las ventajas estratégicas de utilizar un monorepo gestionado con Nx para construir aplicaciones complejas y mantener la integridad arquitectónica.",
    author: { username: "Raz Podestá" },
    published_date: "2025-11-16",
    tags: [
      { name: "DevOps", slug: "devops" },
      { name: "Nx", slug: "nx" }
    ],
    content: `
## El Mito del Monolito

A menudo se confunde "Monorepo" con "Monolito". Nada más lejos de la realidad. Un monorepo bien gestionado con Nx es una colección de micro-librerías altamente modulares que conviven en armonía.

### Beneficios Tangibles

1.  **Código Compartido:** Definir interfaces de TypeScript en una librería \`shared/types\` y consumirlas tanto en el Frontend como en el Backend asegura una consistencia de tipos absoluta.
2.  **Atomicidad de Build:** Nx es lo suficientemente inteligente para reconstruir y volver a probar *solo* lo que ha cambiado.
3.  **Visibilidad Holística:** Refactorizar una función crítica es seguro porque puedes ver todos sus usos en todo el ecosistema en un solo commit.

## Estructura de Librerías

Nuestra arquitectura divide el código en cuatro tipos de librerías:

*   **Feature:** Contiene componentes inteligentes y lógica de negocio.
*   **UI:** Componentes "tontos" y reutilizables (Botones, Inputs).
*   **Util:** Funciones puras y helpers.
*   **Data-Access:** Comunicación con APIs y gestión de estado.

Esta separación de intereses mantiene el código limpio y testeable.
    `
  },
  {
    slug: 'que-es-una-pwa',
    title: "¿Qué es una PWA? La Web App Nativa",
    description: "Descubre cómo las Progressive Web Apps están revolucionando la experiencia móvil, combinando lo mejor de la web y las aplicaciones nativas.",
    author: { username: "Raz Podestá" },
    published_date: "2025-11-12",
    tags: [
      { name: "PWA", slug: "pwa" },
      { name: "Mobile", slug: "mobile" }
    ],
    content: `
## El Puente entre Dos Mundos

Las Progressive Web Apps (PWA) son aplicaciones web que utilizan APIs modernas del navegador para ofrecer capacidades que antes eran exclusivas de las apps nativas.

### Capacidades Clave

*   **Instalabilidad:** Pueden añadirse a la pantalla de inicio sin pasar por una App Store.
*   **Offline First:** Gracias a los Service Workers, una PWA puede funcionar sin conexión a internet, cacheando recursos críticos y datos.
*   **Notificaciones Push:** Permiten re-enganchar al usuario incluso cuando el navegador está cerrado.

## ¿Por qué elegir PWA para tu negocio?

El coste de desarrollo de una app nativa (iOS + Android) es alto. Una PWA te permite tener una sola base de código que funciona en todas partes, es indexable por Google (SEO) y se actualiza instantáneamente sin esperar aprobación de tiendas.

Para este portafolio, hemos implementado un manifiesto web completo y estrategias de cacheo agresivas para garantizar una experiencia instantánea.
    `
  },
  {
    slug: 'zod-fuente-de-verdad',
    title: "Zod: La Única Fuente de Verdad",
    description: "Descubre cómo utilizar Zod para definir esquemas de datos se convierte en el pilar para un código robusto, seguro y fácil de mantener.",
    author: { username: "Raz Podestá" },
    published_date: "2025-11-14",
    tags: [
      { name: "TypeScript", slug: "typescript" },
      { name: "Calidad", slug: "calidad" }
    ],
    content: `
## TypeScript no es suficiente

TypeScript es fantástico para la validación en tiempo de compilación, pero desaparece en tiempo de ejecución (runtime). Aquí es donde entra Zod.

### El Patrón "Esquema Primero"

En lugar de definir interfaces manualmente, definimos esquemas de validación:

\`\`\`typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'user'])
});

export type User = z.infer<typeof UserSchema>;
\`\`\`

### Beneficios Inmediatos

1.  **Validación de API:** Al recibir datos del backend, los pasamos por \`UserSchema.parse()\`. Si los datos son incorrectos, fallamos rápido y con errores descriptivos.
2.  **Sincronización:** El tipo de TypeScript siempre está perfectamente sincronizado con la lógica de validación.
3.  **Seguridad:** Previene errores silenciosos y datos corruptos fluyendo por la aplicación.

En este proyecto, usamos Zod para todo: desde validar variables de entorno hasta los formularios de contacto y las respuestas del CMS.
    `
  }
];

// --- PERFIL DE GAMIFICACIÓN MOCK ---
export const MOCK_PROFILE: UserGamificationProfile = {
  level: 5,
  currentXp: 450,
  nextLevelXp: 800,
  progressPercent: 56.25,
  inventory: [
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
    },
    {
      id: 'mock-item-2',
      acquiredAt: new Date().toISOString(),
      isEquipped: false,
      artifact: {
        id: 'monolito-obsidiana',
        slug: 'monolito-obsidiana',
        name: 'El Monolito de Obsidiana',
        description: 'La base de datos inmutable. Donde todo comienza.',
        house: 'ARCHITECTS',
        rarity: 'COMMON',
        baseValue: 10
      }
    }
  ]
};

// --- CÓDICE MOCK ---
export const MOCK_CODEX: Artifact[] = [
    MOCK_PROFILE.inventory[0].artifact,
    MOCK_PROFILE.inventory[1].artifact
];
