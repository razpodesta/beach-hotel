# Documento Conceptual: Orquestador del Shell Localizado (Oxygen Shell)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/src/app/[lang]/layout.md`
- **Ruta Origen:** `apps/portfolio-web/src/app/[lang]/layout.tsx`
- **Tipo de Aparato:** Orquestador de Experiencia Localizada / Inyector de Narrativa.
- **Silo / Dominio:** Experiencia de Usuario (UX) / Internacionalización (MACS).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato actúa como el **Traductor Universal** del ecosistema. Mientras el Root Layout prepara la biología (fuentes y estilos), el `LocalizedLayout` prepara el intelecto. Es el punto de convergencia donde la infraestructura técnica se encuentra con el contenido humano:
- **Sincronía MACS:** Recupera el diccionario de mensajes basado en el segmento de ruta `[lang]` y lo distribuye a los organismos de UI.
- **Capa Operativa:** Inyecta los componentes de control global que no pertenecen a una página específica, como el `VisitorHud` (telemetría) y el `AuthPortal` (identidad).
- **SEO Internacional:** Orquesta los metadatos dinámicos y genera las etiquetas `hreflang` para asegurar que Google indexe correctamente cada versión regional.

## 3. ANATOMÍA FUNCIONAL
1. **Generador de Perímetros:** Utiliza `generateStaticParams` para pre-renderizar en el servidor (SSG) todas las versiones de idioma del hotel, eliminando la latencia de traducción en el primer acceso.
2. **Inyección de Trazabilidad (NavigationTracker):** Envuelto en un límite de `Suspense` para permitir el *Bailout* de parámetros de búsqueda en el cliente sin romper el renderizado estático del servidor.
3. **Señalética en Vivo (SystemStatusTicker):** Provee un flujo constante de información (telemetría de ocupación, clima, alertas del festival) en el perímetro superior del viewport.
4. **Bóveda de Identidad (Auth & Newsletter):** Orquesta los portales de acceso y captación de leads en la capa superior del DOM (Z-Index 100+), asegurando que la interacción sea fluida (MEA/UX).

## 4. APORTE AL ECOSISTEMA SOBERANO
Es el guardián de la **Inmunidad de Navegación**. Al centralizar el `Header` y el `Footer` aquí, garantizamos una "Succión Digital" sin parpadeos (*Flicker-free*) entre páginas del mismo idioma. Su integración con el `route-guard.ts` asegura que la interfaz se adapte visualmente al rol del usuario (S0-S4) mediante la hidratación de diccionarios específicos.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Carga Diferida de Portales (Dynamic Portals):** Convertir el `AuthPortal` y `NewsletterModal` en importaciones dinámicas (`next/dynamic`) disparadas solo por la intención del usuario, reduciendo el bundle inicial de JavaScript en un 15%.
2. **Pre-calentamiento de Diccionarios (Edge Dict-Warmup):** Implementar una función en el middleware que inyecte el diccionario en el caché del Edge antes de que la petición llegue al servidor, minimizando el tiempo de hidratación de la UI.

---

