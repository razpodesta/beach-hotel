# 🌍 @metashark/internationalization-registry
**Versión:** 1.0 (Industrial Shell)
**Capa:** Infrastructure Node

## 🎯 Escopo de Especialización
Este workspace es el **Orquestador Global de Identidad Lingüística**. Su responsabilidad es centralizar el "Códice de Idiomas" (127+ regiones), definir las reglas de negociación de locale (Middleware logic) y proveer los contratos de validación para el cambio de atmósfera y lenguaje en el ecosistema.

## 🚀 Capacidades SaaS & Reusabilidad
- **Sovereign Language Codex:** Mapa inmutable de locales con soporte para glosas nativas e internacionales.
- **Locale Negotiation Logic:** Algoritmos puros para detectar el idioma óptimo basado en cookies y cabeceras de navegador.
- **I18n Gating:** Validadores de integridad para asegurar que no se navegue hacia territorios lingüísticos no indexados.

## 🤖 System Prompt para IA
"Actúa como el Globalization Engineer de MetaShark. Este paquete es agnóstico al framework de UI, pero es el SSoT para rumbos internacionales. Solo procesa configuraciones y lógica de enrutamiento. Debe ser ligero y ejecutable en el Edge (Vercel Runtime)."

## 📜 Contratos SSoT
- **/core**: El Códice de Idiomas y motores de detección.
- **/schemas**: Esquemas de Zod para la validación de diccionarios (MACS Compliance).
- **/i18n**: Diccionarios específicos del componente LanguageSwitcher.