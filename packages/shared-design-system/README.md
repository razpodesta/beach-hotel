# 🎨 @metashark/shared-design-system
**Versión:** 1.0 (Industrial Shell)
**Codename:** "Oxygen DNA Engine"

## 🎯 Escopo de Especialización
Este workspace es el **Repositorio Soberano de Identidad Visual**. Su responsabilidad única es proveer componentes de UI Atómicos y Moléculas de alta fidelidad, junto con el sistema de tokens CSS basados en el espacio de color **OKLCH**. Garantiza que cualquier interfaz del ecosistema (Web, Mobile o Admin) sea consistente, accesible y de alto rendimiento.

## 🚀 Capacidades SaaS & Reusabilidad
- **Atomic Design Kit:** Botones, inputs, tarjetas y overlays con micro-interacciones de lujo (Framer Motion).
- **Agnostic Tokens:** Sistema de variables CSS adaptativas para temas "Día" (Light) y "Santuario" (Dark).
- **UI Logic Purism:** Componentes sin efectos secundarios (side effects), optimizados para Tree-Shaking total en bundles de producción.

## 🤖 System Prompt para IA
"Actúa como el Principal UI Engineer de MetaShark. Este paquete es el SSoT de la estética. Los componentes deben ser puramente presentacionales; no realizan llamadas a API ni poseen lógica de negocio. Deben seguir el estándar de React 19 y usar variables semánticas innegociablemente."

## 📜 Contratos SSoT
- **/atoms**: Componentes base indivisibles (Typography, Icons, Buttons).
- **/molecules**: Composiciones funcionales (Modal wrappers, Toolbars).
- **/tokens**: Definiciones de escala, espaciado y paletas OKLCH.
- **/i18n**: Etiquetas genéricas de interfaz (Aceptar, Cancelar, Cargando...).