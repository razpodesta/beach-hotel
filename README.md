🏨 Beach Hotel Canasvieiras & Canasvieiras Fest 2026
![alt text](https://img.shields.io/badge/Next.js-15.2.5-black.svg?logo=next.js)

![alt text](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg?logo=typescript)

![alt text](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?logo=tailwind-css)

![alt text](https://img.shields.io/badge/Nx-Monorepo-blueviolet.svg?logo=nx)
"Afuera es invierno. Adentro, el sol nunca se pone."
Este repositorio constituye el motor digital soberano del Beach Hotel Canasvieiras y su evento insignia: Canasvieiras Fest: The Winter Escape (Pride Escape 2026). Un ecosistema diseñado para transformar la hospitalidad boutique en una experiencia inmersiva de alta conversión.

🏛️ Visión Ejecutiva
El proyecto abandona el concepto de "sitio web" para convertirse en un Activo Digital Escalable. La estrategia se divide en dos dimensiones comerciales orquestadas por un mismo núcleo tecnológico:
Dimensión Hotelera (The Sanctuary): Enfoque en el confort, la exclusividad de sus 40 suites y la ubicación estratégica en la Av. das Nações, Florianópolis.
Dimensión Festival (The Takeover): El mayor evento boutique LGBT+ del Mercosur en temporada baja. Un "escape del frío" diseñado para monopolizar la ocupación y generar ingresos de alto ticket mediante experiencias (Boat Parties, Club Takeovers).
🧱 Arquitectura: El "Lego System"
Siguiendo principios de Ingeniería de Élite, la plataforma se construye mediante Aparatos Lego desacoplados.
🧠 Pilot CMS 3.0 (Sovereign Data)
SSoT (Zod-Driven): Toda la estructura de datos (Suites, Eventos, Precios) está validada por esquemas de Zod en tiempo real.
Bypass i18n: Sistema de internacionalización (pt-BR, es-ES, en-US) mediante diccionarios ensamblados en tiempo de build, garantizando latencia cero en la entrega de contenido.

🛰️ Aparatos Visuales (Core Components)
Aparato	Tecnología	Propósito Comercial
Hero Inmersivo	HTML5 Video + Audio Teaser	Impacto emocional inmediato y venta visual de las suites.
ExperienceShowcase3D	Framer Motion + 3D Stack	Presentación de la cartelera de eventos (Boat Party, etc).
LiveStatusTicker	GSAP Infinite Loop	Generación de FOMO y Prueba Social (Disponibilidad real).
VisitorHud	Geo-Location API	Factor "Wow" tecnológico y personalización por origen (Argentina/Chile).
Visual Synth Gallery	WebGL 2.0 (Orbital)	Atmósfera estética y Hype visual del festival.
🗺️ Mapa de Rutas (Estructura de Navegación)
La navegación ha sido naturalizada para eliminar terminología técnica y priorizar la conversión:
/[lang]/ → Recepção: Landing page del hotel enfocada en la reserva directa.
/[lang]/festival → The Winter Escape: Experiencia inmersiva del Pride Escape 2026.
/[lang]/suites → Acomodações: Catálogo detallado de activos inmobiliarios.
/[lang]/historia → Legado: Narrativa de marca y filosofía boutique.

🛠️ Stack Tecnológico
Capa	Tecnologías Clave
Frontend	Next.js 15 (App Router), React 19, TypeScript 5.9.
Estilos	Tailwind CSS v4 (clases canónicas), CSS Variables semánticas.
Animación	Framer Motion (Interacciones), GSAP (Loops infinitos).
Infraestructura	Nx Monorepo (Gestión modular), pnpm (Workspaces).
Backend/DB	Supabase (Auth & Realtime), Pilot CMS 3.0 (Engine)

🚀 Guía de Desarrollo
Pre-requisitos
Node.js v20+
pnpm v10+
Comandos Críticos

Bash
# 1. Instalar dependencias (Notebook Optimized)
pnpm install

# 2. Generar diccionarios (Solo si se cambia la estructura granular)
pnpm run prebuild:web

# 3. Arrancar servidor de desarrollo (Modo Bypass)
pnpm run dev:web

# 4. Auditoría de Calidad
pnpm run lint


📝 Registro de Nivelación (Fase Actual)

Purga de Portafolio: Eliminadas rutas de desarrollador y 3000 iconos redundantes.

Naturalización Semántica: Rebranding de componentes de "Dev" a "Hospitality".

Motor de Audio: Implementado teaser de 3 segundos con auto-mute de cortesía.

Lego Foundation: Estructura de Home y Festival desacoplada.

Booking Hub: Implementación del motor de reservas inteligente (Siguiente Fase).

© 2026 Beach Hotel Canasvieiras.
Arquitectura y Estrategia forjada por Raz Podestá | MetaShark Tech.