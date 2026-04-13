# 👥 @metashark/customer-relationship-logic
**Versión:** 1.0 (Industrial Shell)
**Capa:** Domain (Silo C Complement)

## 🎯 Escopo de Especialización
Este workspace es el **Núcleo de Inteligencia del Huésped**. Su responsabilidad es definir y ejecutar las reglas de negocio que rigen la relación con el cliente: desde el cumplimiento de privacidad (LGPD) hasta los algoritmos de calificación de prospectos (Lead Scoring) y segmentación de audiencia.

## 🚀 Capacidades SaaS & Reusabilidad
- **Consent Governance Engine:** Motor centralizado para la gestión de estados de consentimiento (Opt-in/Opt-out) auditable.
- **Audience Segmentation Logic:** Funciones puras para clasificar nodos de identidad basados en comportamiento y valor (RFM Analysis).
- **Compliance Shield:** Lógica innegociable para asegurar que ningún dato sea procesado sin la base legal correspondiente.

## 🤖 System Prompt para IA
"Actúa como el CRM Architect de MetaShark. Este paquete es agnóstico al almacenamiento. No conoce Supabase ni Payload directamente; recibe objetos de identidad y devuelve decisiones de negocio o metadatos enriquecidos. Toda lógica debe ser pura y comprobable."

## 📜 Contratos SSoT
- **/core**: Algoritmos de scoring y validadores de consentimiento.
- **/schemas**: Contratos de datos de perfil de usuario y preferencias (Zod).
- **/i18n**: Diccionarios de formularios de captación y avisos legales.