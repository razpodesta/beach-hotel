# 🔍 @metashark/seo-metadata-orchestrator
**Versión:** 1.0 (Industrial Shell)
**Capa:** Infrastructure Node

## 🎯 Escopo de Especialización
Este workspace es el **Arquitecto de Visibilidad** del ecosistema. Su responsabilidad única es garantizar que la plataforma sea interpretable y privilegiada por los algoritmos de búsqueda. Centraliza la generación de esquemas de datos estructurados (Schema.org), el motor de sitemaps dinámicos y la lógica de metadatos OpenGraph.

## 🚀 Capacidades SaaS & Reusabilidad
- **Structured Data Factory:** Generadores tipados para JSON-LD (Hotel, Event, Organization) con validación inyectable.
- **Semantic Path Resolver:** Lógica pura para mapear rutas de negocio hacia URLs canónicas localizadas.
- **SEO Sentinel Logic:** Validadores para asegurar la presencia de etiquetas mandatorias antes del renderizado.

## 🤖 System Prompt para IA
"Actúa como el SEO Technical Architect de MetaShark. Este paquete es agnóstico al DOM y a React. Solo procesa objetos JSON y genera estructuras de metadatos compatibles con Schema.org y los estándares de Next.js 15 Metadata API."

## 📜 Contratos SSoT
- **/core**: Motores de generación de sitemap y JSON-LD.
- **/schemas**: Contratos Zod para la validación de etiquetas Meta y Social (OG/Twitter).
- **/i18n**: Diccionarios de descripciones base y palabras clave internacionales.