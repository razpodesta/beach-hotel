# Manifiesto de Rutas y Arquitectura de Navegación
**Versión: 1.0**
**Fecha: 2025-11-12**

## 1. Filosofía: "Intención y Claridad"

Toda ruta en este ecosistema digital debe ser semántica, predecible y optimizada para los motores de búsqueda y la experiencia humana. Las URLs no son un detalle técnico, son la primera capa de la interfaz de usuario. Nuestra filosofía se basa en tres principios inquebrantables:

1.  **Internacionalización (i18n) Primero:** Toda ruta navegable por el usuario **DEBE** estar prefijada por su código de idioma (`/es-ES`, `/en-US`, `/pt-BR`).
2.  **SEO-Céntricas:** Las rutas deben ser descriptivas, utilizar guiones (`-`) para separar palabras y contener palabras clave relevantes que describan el contenido de la página.
3.  **Fuente Única de Verdad (SSoT):** Todas las rutas de la aplicación **DEBEN** estar centralizadas y exportadas desde el archivo `apps/portfolio-web/src/lib/nav-links.ts` para garantizar la consistencia y facilitar el mantenimiento.

## 2. Estructura de URL Canónica

El formato obligatorio para todas las rutas es el siguiente:
`https://[dominio]/[lang]/[segmento-descriptivo-1]/[segmento-descriptivo-2]/...`

## 3. Mapa de Rutas Principal

| Sección      | Ruta (Path)                      | Propósito                                                   | Estado      |
| :----------- | :------------------------------- | :---------------------------------------------------------- | :---------- |
| **Principal**| `/`                              | Redirige a la página de inicio del idioma por defecto.      | N/A         |
|              | `/quien-soy`                     | Página de presentación, historia y filosofía (Sobre Mí).    | **Pública** |
|              | `/mision-y-vision`               | Detalla la misión y visión profesional y empresarial.       | **Pública** |
|              | `/contacto`                      | Formulario de contacto y detalles de comunicación.          | **Pública** |
| **Blog**     | `/blog`                          | Página principal del blog, listado de artículos.            | **Pública** |
|              | `/blog/[slug]`                   | Página de detalle para un artículo de blog específico.      | **Pública** |
|              | `/blog/categorias/[category]`    | Página de archivo para una categoría de artículos.          | **Pública** |
| **Desarrollo** | `/sistema-de-diseno`             | Showcase de los componentes de UI reutilizables (Storybook-like). | **Pública** |

## 4. Implementación

La implementación de estas rutas se gestiona a través de la estructura de carpetas en `apps/portfolio-web/src/app/[lang]/` y se centraliza en `nav-links.ts` para su uso en componentes como el `Header` y el `Footer`. El guardián de rutas en `route-guard.ts` **DEBE** ser actualizado para reflejar el estado público de estas nuevas rutas.
