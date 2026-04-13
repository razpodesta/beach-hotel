# 💎 @metashark/webgl-rendering-engine
**Versión:** 1.0 (Industrial Shell)
**Capa:** Presentation / Graphics Core

## 🎯 Escopo de Especialización
Este workspace es el **Motor de Síntesis Visual** del ecosistema. Su responsabilidad única es la orquestación de experiencias inmersivas 3D y 2D aceleradas por GPU. Encapsula la gestión de contextos WebGL 2.0, compilación de Shaders (GLSL), motores de inercia física basados en cuaterniones y post-procesamiento cinemático.

## 🚀 Capacidades SaaS & Reusabilidad
- **Atlas Texture Orchestrator:** Lógica para la generación dinámica de atlas de texturas optimizados para reducir Draw Calls.
- **Kinematic Physics Engine:** Algoritmos puros (gl-matrix) para rotaciones, slerps y desplazamientos con inercia orgánica.
- **Shader Library:** Repositorio de efectos visuales (Glitches, Blurs, Color-waves) optimizados para GPU.

## 🤖 System Prompt para IA
"Actúa como el Graphics Engineer de MetaShark. Este paquete es de alta performance. El renderizado debe ser determinista y eficiente en memoria. No posee lógica de negocio; solo procesa buffers de vértices, mallas y uniformes. Debe ser compatible con React Three Fiber y motores WebGL puros."

## 📜 Contratos SSoT
- **/core**: Implementación de motores de render y clases de cámara/escena.
- **/shaders**: Archivos fuente .glsl para procesamiento de fragmentos y vértices.
- **/schemas**: Contratos Zod para la validación de configuraciones de escena y materiales.