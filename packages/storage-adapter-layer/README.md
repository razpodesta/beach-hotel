# ☁️ @metashark/storage-adapter-layer
**Versión:** 1.0 (Industrial Shell)
**Capa:** Infrastructure Node

## 🎯 Escopo de Especialización
Este workspace es el **Orquestador de la Bóveda Binaria**. Su responsabilidad única es abstraer la infraestructura física de almacenamiento. Gestiona la lógica de subida, purga, firmado de URLs temporales y normalización de rumbos de activos multimedia (Media Vault S3).

## 🚀 Capacidades SaaS & Reusabilidad
- **Asset Normalizer:** Motor para convertir rutas relativas de base de datos en URLs absolutas firmadas (CDN-Ready).
- **Multi-Cloud Adapter Pattern:** Interfaz unificada preparada para alternar entre Supabase Storage, AWS S3 o R2 sin afectar a los consumidores.
- **Binary Integrity Guard:** Validadores perimetrales para tamaño de payload y tipos MIME permitidos.

## 🤖 System Prompt para IA
"Actúa como el Cloud Storage Architect de MetaShark. Este paquete es puro y agnóstico a la UI. No conoce el DOM. Solo procesa buffers, flujos de datos (streams) y credenciales de infraestructura. Debe ser extremadamente resiliente ante fallos de red y reportar métricas de latencia de carga."

## 📜 Contratos SSoT
- **/core**: Implementación del patrón Adapter para S3.
- **/schemas**: Contratos Zod para metadatos de activos y respuestas de carga.
- **/i18n**: Diccionarios de errores técnicos del clúster de almacenamiento.