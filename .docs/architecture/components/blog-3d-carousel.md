# Auditoría y Documentación: BlogSection3D (Orbital Carousel)
**Componente:** `BlogSection3D.tsx`
**Dependencias:** `BlogCard3D.tsx`, `cms.mocks.ts`, `blog/actions.ts`
**Estado:** ⚠️ Requiere Corrección de Datos (Data Mapping Mismatch)

## 1. Análisis Funcional y UX
Este componente es un **Carrusel Orbital 3D Interactivo**.
*   **Funcionamiento:** Renderiza tarjetas de artículos de blog flotando en un espacio 3D, dispuestas circularmente.
*   **Interactividad:**
    *   **Drag & Swipe:** Sí, es interactivo. Utiliza la librería `@use-gesture/react`. El usuario puede arrastrar horizontalmente (con el mouse o el dedo) para rotar el carrusel.
    *   **Física:** Utiliza `react-spring` para dar inercia y suavidad al movimiento de rotación (`rotationY`).
    *   **Hover:** Al pasar el mouse sobre una tarjeta (`BlogCard3D`), esta se escala (x1.1) y aumenta su opacidad, indicando que es seleccionable.
    *   **Click:** Al hacer clic, navega a la ruta dinámica del artículo `/blog/[slug]`.
*   **Tecnología Visual:**
    *   Utiliza **React Three Fiber (R3F)** para el Canvas WebGL.
    *   Utiliza el componente `<Html>` de `drei` para renderizar contenido HTML semántico dentro del mundo 3D, lo que garantiza accesibilidad y SEO (el texto es seleccionable).

## 2. Auditoría de Datos y Backend (Diagnóstico del Error "Undefined")
Actualmente, el componente muestra títulos "undefined" debido a un error en el flujo de datos simulados (Mocks).

**El Problema:**
1.  **Origen:** `src/data/mocks/cms.mocks.ts` exporta `MOCK_POSTS` ya formateados con la estructura final (`PostWithSlug`), donde el título está dentro de `metadata`.
2.  **Intermediario:** `src/lib/graphql-client.ts` devuelve estos mocks crudos cuando simula la API.
3.  **El Fallo:** `src/lib/blog/actions.ts` intenta mapear estos datos usando la función `mapCmsDataToPost`. Esta función espera una estructura "plana" de CMS (ej: `entry.title`), pero recibe la estructura ya anidada del mock.
    *   *Código actual:* Busca `entry.title` -> Encuentra `undefined` (porque está en `entry.metadata.title`).
    *   *Resultado:* Pasa un objeto con título `undefined` a la UI.

**Solución Requerida:**
Alinear la estructura de `MOCK_POSTS` para que imite la respuesta cruda de GraphQL (plana), o ajustar el adaptador de mocks en `graphql-client.ts` para que no pase por el mapeador si ya son datos procesados.

## 3. Estrategia de Imágenes (Assets)
El código en `BlogCard3D.tsx` define la ruta de la imagen así:
```typescript
const imageUrl = `/images/blog/${post.slug}.jpg`;
Para que el componente funcione visualmente, debes crear los siguientes archivos en la carpeta public/.
Inventario de Imágenes Requeridas
Ruta Base: apps/portfolio-web/public/images/blog/
Formato: .jpg (Optimizado para web)
Dimensiones Sugeridas: 800x600px (Aspect Ratio 4:3) o 1200x630px.
Nombre del Archivo	Slug del Post (Mock)	Estado Actual (Snapshot)
arquitectura-por-manifiesto.jpg	arquitectura-por-manifiesto	❌ Faltante / No verificable
filosofia-mobile-first.jpg	filosofia-mobile-first	❌ Faltante / No verificable
monorepo-con-nx.jpg	monorepo-con-nx	❌ Faltante / No verificable
que-es-una-pwa.jpg	que-es-una-pwa	❌ Faltante / No verificable
zod-fuente-de-verdad.jpg	zod-fuente-de-verdad	❌ Faltante / No verificable
4. Integración Futura con CMS Backend
El componente está preparado arquitectónicamente para el CMS real (cms-api):
Desacoplamiento: El componente no sabe de dónde vienen los datos, solo recibe PostWithSlug[].
Cliente GraphQL: lib/graphql-client.ts ya tiene la lógica para cambiar entre Mocks y API Real (process.env.CMS_GRAPHQL_ENDPOINT).
Server Actions: lib/blog/actions.ts maneja la petición.
Pasos para Producción:
Levantar cms-api (Apollo Server).
Definir CMS_GRAPHQL_ENDPOINT en .env.local.
Asegurar que el Resolver de GraphQL devuelva los campos exactos que espera mapCmsDataToPost (title, slug, description, content, published_date, tags, author).
5. Auditoría de Código (Snapshot)
BlogSection3D.tsx: Código limpio, usa Suspense para carga, maneja estado de hidratación (isClient). Correcto.
BlogCard3D.tsx: Usa Html con transform y occlude. Esto es excelente para performance, ya que oculta el DOM cuando la tarjeta está tapada por otra geometría 3D.
Advertencia: Estás usando dangerouslyAllowSVG: true en next.config.js. Asegúrate de sanitizar si permites SVGs de usuarios en el futuro CMS.

---


