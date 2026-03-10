# Guía Maestra de SEO para el Portafolio
**Versión: 2.0**
**Fecha: 2025-11-07**

## Objetivo

Asegurar que este portafolio esté construido y optimizado para alcanzar la máxima visibilidad en los motores de búsqueda. El objetivo es posicionar mi marca personal como un referente en desarrollo web, demostrando excelencia técnica y una experiencia de usuario de primer nivel, en línea con los algoritmos de Google de 2025.

## I. Factores de Posicionamiento y Ponderación (Algoritmo 2025)

El algoritmo de Google se centra en la Experiencia del Usuario (UX) y la Calidad del Contenido (E-E-A-T y HCS). La ponderación para un sitio de portafolio es la siguiente:

| Grupo de Factores                               | Ponderación Estimada | Descripción y Relación con el Portafolio                                                                                                                              |
| ----------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Calidad y Utilidad del Contenido (E-E-A-T)   | 40%                  | El factor más crítico. Demuestra mi **Experiencia, Pericia, Autoridad y Fiabilidad** a través de descripciones de proyectos, estudios de caso y una clara autoría.       |
| 2. Experiencia de Página (UX / Core Web Vitals) | 30%                  | Mide la calidad de la interacción del usuario. Un portafolio rápido y fluido (LCP, INP, CLS) es en sí mismo una demostración de mi habilidad técnica.                   |
| 3. Autoridad y Backlinks (Off-Page SEO)         | 20%                  | La reputación del sitio, medida por enlaces de calidad desde otros sitios (perfiles sociales, colaboraciones, directorios de desarrolladores).                        |
| 4. Relevancia y Optimización Técnica (On-Page)  | 10%                  | La base técnica: optimización de palabras clave (ej. "desarrollador Next.js"), estructura de URLs, meta etiquetas y datos estructurados.                             |

---

## II. Detalle de Factores Clave y Mejores Prácticas

### A. Contenido y E-E-A-T (Experiencia, Pericia, Autoridad, Fiabilidad)

| Factor                    | Explicación                                                                                              | Mejores Prácticas (Aplicadas y Futuras)                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Intención de Búsqueda** | El contenido debe satisfacer la necesidad del visitante (ej. un reclutador buscando talento, un cliente potencial). | **Acción:** El portafolio está estructurado para llevar al usuario desde la presentación (`HeroSection`) hasta la evidencia (`ProjectsSection`) y la acción (`ContactSection`).                         |
| **Contenido Útil (HCS)**  | El contenido debe ser original, profundo y demostrar conocimiento de primera mano.                       | **Acción:** Las descripciones en `projects-data.ts` deben ser detalladas, explicando los desafíos técnicos y las soluciones implementadas en cada proyecto.                                            |
| **Autoría y Transparencia** | Identificar claramente al autor para demostrar pericia.                                                  | **Acción Realizada:** Se ha implementado el **schema `Person`** en `page.tsx`. Los enlaces a GitHub y LinkedIn en el `Footer` son cruciales y deben estar actualizados.                                |
| **Coherencia Semántica**  | Usar un lenguaje natural y un campo semántico amplio alrededor de las habilidades clave (Next.js, React, etc.). | **Acción:** Utilizar términos relacionados en las descripciones de los proyectos para demostrar una cobertura exhaustiva de las tecnologías.                                                              |

### B. Experiencia de Página y Core Web Vitals (Técnico)

| Métrica CWV                       | Definición                                                                                               | Umbral (Google)      | Mejores Prácticas (Implementadas)                                                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LCP (Largest Contentful Paint)**  | Mide el tiempo de carga del elemento más grande.                                                         | < 2.5 segundos       | Optimización de imágenes (`next/image`), carga prioritaria de recursos críticos y renderizado en servidor (SSR/SSG) con Next.js.                                                       |
| **INP (Interaction to Next Paint)** | Mide la latencia de la interacción del usuario.                                                          | < 200 milisegundos   | Minimizar el JavaScript que bloquea el hilo principal. Uso de componentes de cliente (`'use client'`) solo cuando es estrictamente necesario para la interactividad.                  |
| **CLS (Cumulative Layout Shift)**   | Mide la inestabilidad visual de la página.                                                               | < 0.1                | Reservar espacio para imágenes especificando sus dimensiones (gestionado automáticamente por `next/image`). Evitar la inyección de contenido dinámico sin un espacio reservado.       |
| **Mobile-First Indexing**         | Google utiliza la versión móvil para la indexación.                                                      | 100% Adaptable       | **Acción Realizada:** El diseño es totalmente responsivo gracias a Tailwind CSS, garantizando una experiencia idéntica en contenido y funcionalidad en todos los dispositivos.          |

### C. Optimización Técnica (On-Page SEO)

| Factor                              | Explicación                                                                            | Mejores Prácticas (Implementadas)                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Datos Estructurados (Schema)**    | Código que ayuda a los motores de búsqueda a comprender el contenido.                  | **Acción Realizada:** Se implementó el schema `Person` en formato JSON-LD a través del componente `JsonLdScript.tsx`. Se deben validar los datos para asegurar que no haya errores. |
| **Arquitectura del Sitio**          | La forma en que las páginas están organizadas y enlazadas.                             | **Acción Realizada:** La estructura es de una sola página (SPA-like), lo que simplifica la arquitectura. Los enlaces de anclaje (`#projects`, `#contact`) facilitan la navegación interna.               |
| **URLs y Títulos**                  | Deben ser descriptivos, concisos e incluir palabras clave.                             | **Acción Realizada:** El `layout.tsx` y `page.tsx` generan etiquetas `<title>` dinámicas y descriptivas para cada idioma, mejorando la relevancia.                                                          |
| **Rastreo e Indexación**            | Controlar qué páginas puede ver e indexar Google.                                      | **Acción:** Se debe generar y enviar un `sitemap.xml` a Google Search Console. El archivo `robots.txt` debe permitir el rastreo de todo el contenido relevante.                                      |

---

## III. Resumen de Directrices

1.  **Rendimiento Extremo (CWV):** El código debe estar siempre optimizado para superar los umbrales de Core Web Vitals. Las auditorías con Lighthouse deben realizarse periódicamente.
2.  **Semántica HTML5:** Utilizar etiquetas semánticas (`<article>`, `<section>`, `<nav>`) para mejorar la comprensión del contenido.
3.  **Accesibilidad (A11Y):** El código debe cumplir con las directrices WCAG. La accesibilidad es un componente directo de la UX que Google valora.
4.  **Internacionalización (Hreflang):** **Acción Realizada:** Las etiquetas `hreflang` se generan correctamente en `[lang]/layout.tsx`, indicando a Google las versiones de idioma de la página.

---


