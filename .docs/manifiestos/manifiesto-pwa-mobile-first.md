Manifiesto: PWA Mobile-First de Élite
Versión: 1.0
Estatus: OBLIGATORIO
Proyecto: Beach Hotel Canasvieiras & Canasvieiras Fest 2026
1. Filosofía: "La Palma de la Mano como Epicentro"
En el contexto de un hotel de playa y un festival internacional, el 90% de nuestras interacciones ocurren en movimiento: en el aeropuerto, en la arena, o en la cubierta de un barco. Por tanto, la experiencia Mobile-First no es una opción técnica, es una necesidad estratégica.
Nuestra PWA (Progressive Web App) debe sentirse como una extensión orgánica del dispositivo del usuario, eliminando la fricción entre el mundo físico y el digital.
2. Los 5 Pilares de la Experiencia de Élite
I. Velocidad de Reacción (Instant Load)
Métrica: LCP (Largest Contentful Paint) < 1.2s en conexiones 4G.
Regla: Cada aparato debe utilizar Streaming SSR y Skeleton Patterns para que el usuario nunca perciba una pantalla vacía. La notebook o el smartphone deben renderizar la "intención" del componente antes que los datos finales.
II. Diseño Ergonómico (Thumb-Driven UX)
Regla de Oro: Los elementos críticos de navegación (Reservar, Tickets, Mapa) deben ser accesibles con el pulgar en el tercio inferior de la pantalla.
Interacción: Uso obligatorio de Gestures (swipes) para los carruseles 3D y galerías. El "click" es secundario; el "desplazamiento" es el rey.
III. Estética Inmersiva (Luxury Visuals)
Glassmorphism: Uso de transparencias y desenfoques (backdrop-blur) para simular capas de cristal de alta tecnología.
Dark Mode Nativo: La interfaz base es oscura para resaltar los neones del festival y proteger la visión del usuario en entornos nocturnos.
Micro-interacciones: Cada acción (un toggle, un botón de mute) debe tener un feedback visual sutil pero costoso (Luxury feel).
IV. Resiliencia y Offline (Sovereign PWA)
Service Workers: Cacheo agresivo de los assets del festival. El usuario debe poder consultar su itinerario o el mapa del hotel incluso con señal intermitente en alta mar.
Instalabilidad: El prompt de "Añadir a pantalla de inicio" debe presentarse como una invitación a un club exclusivo, no como una alerta técnica.
V. Conciencia de Contexto (Live HUD)
Real-Time: Los aparatos (como el Ticker) deben actualizarse con WebSockets o polling inteligente para reflejar el clima de Canasvieiras o el estado del check-in al instante.
Personalización: Si el usuario está en Florianópolis (vía Geo-API), la PWA prioriza el botón "Como llegar al Hotel". Si está fuera, prioriza "Ver Disponibilidad".
🏗️ Requisitos Técnicos por "Aparato" (Checklist)
Cada componente Lego inyectado en la plataforma debe cumplir con:
Agnosticismo de Pantalla: El código debe escalar de 360px a 4K, pero el diseño se pule primero en 390x844 (iPhone standard).
Touch Targets: Ningún elemento interactivo puede tener un área menor a 44x44px.
Prevención de CLS: Las alturas de los videos y carruseles deben estar reservadas para evitar saltos de contenido durante la carga.
Optimización de Assets: Imágenes en WebP/AVIF y videos comprimidos específicamente para consumo móvil.
🚀 Visión de Futuro: Wrappers Nativos
Este manifiesto prepara el terreno para que, en la Fase 4, la PWA sea empaquetada mediante Capacitor o Tauri para su distribución en App Store y Play Store sin reescribir una sola línea de lógica visual.

---

