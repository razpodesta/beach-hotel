# Documento Conceptual: Authorized Shell Absoluto (Root Layout)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/layout.md`
- **Ruta Origen:** `apps/portfolio-web/src/app/layout.tsx`
- **Tipo de Aparato:** Authorized Shell / Root Orchestrator.
- **Silo / Dominio:** Infraestructura de Presentación / Global UI.

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato constituye la base biológica del ecosistema MetaShark. Es el nivel más bajo de la jerarquía de renderizado de Next.js 15. Su responsabilidad no es la narrativa (delegada a los diccionarios MACS), sino la **Infraestructura Sensorial**:
- **Inyección de Fuentes:** Carga los binarios de Google Fonts e Identidad Local definidos en `fonts.ts`.
- **Persistencia de Estado:** Envuelve a toda la aplicación en el nodo `Providers`, permitiendo que el estado de `Zustand` y `next-themes` sobreviva a las transiciones entre rutas de idioma (ej: de `/es-ES` a `/pt-BR`).
- **Gobernanza CSS:** Es el punto de entrada único para `global.css`, asegurando que los tokens OKLCH estén disponibles en el nivel `:root`.

## 3. ANATOMÍA FUNCIONAL
1. **DOM Bootstrap:** Define las etiquetas primarias `<html>` y `<body>`. Utiliza `suppressHydrationWarning` para gestionar de forma resiliente la inyección de clases de tema por parte de `next-themes`.
2. **Sincronía de Tipografía:** Inyecta las variables CSS de fuente en el `className` del `html`, permitiendo que Tailwind v4 reconozca los tokens `font-sans`, `font-display` y `font-signature`.
3. **Control de Inercia:** Configura globalmente `scroll-smooth` para una experiencia de navegación boutique.
4. **Capa de Abstracción de Datos:** Al ser un Server Component puro, no bloquea el hilo principal del cliente, permitiendo un *First Contentful Paint* (FCP) extremadamente veloz.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato es vital para el **Pilar VII (Theming Soberano)**. Al centralizar los `Providers` aquí, garantizamos que el "Handshake de Identidad" con Supabase Auth ocurra en un solo lugar, inyectando el perfil del usuario de forma transversal a todas las páginas del Hotel y el Portal.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Orquestación de Viewport Meta:** Mover la definición de `viewport` (theme-color, width, scale) de las páginas individuales a este layout para asegurar que la UI del navegador se adapte cromáticamente al modo Día/Noche instantáneamente.
2. **Pre-fetching de Activos Críticos:** Inyectar directivas de `dns-prefetch` y `preconnect` para los dominios de Supabase y Resend, optimizando la latencia de las Server Actions subsiguientes.

---

