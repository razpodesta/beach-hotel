# 🛡️ @metashark/telemetry-observability-service
**Versión:** 1.0 (Industrial Shell)
**Codename:** "Heimdall Core"

## 🎯 Escopo de Especialización
Este workspace es el **Sistema Inmunológico del Ecosistema**. Su responsabilidad única es proveer las herramientas de monitoreo, trazabilidad y diagnóstico forense. Centraliza la lógica de logging estructurado, la gestión de Trace IDs transaccionales y la medición de performance de alta precisión.

## 🚀 Capacidades SaaS & Reusabilidad
- **Heimdall Pulse:** Motor de logging cromático estandarizado para entornos Node.js y Edge Runtime.
- **Trace Orchestrator:** Generador de identificadores únicos para el seguimiento de peticiones a través de múltiples silos.
- **Latency Sentinel:** Utilidades para la medición de tiempos de ejecución con resolución de nanosegundos (performance.now).

## 🤖 System Prompt para IA
"Actúa como el Site Reliability Engineer (SRE) de MetaShark. Este paquete es la base de la confianza técnica. Toda función debe ser de bajísima latencia para no penalizar el runtime. El logging debe seguir estrictamente la Paleta C de MetaShark (ANSI Colors)."

## 📜 Contratos SSoT
- **/core**: Motores de logging, trazadores y cronómetros.
- **/schemas**: Contratos Zod para reportes de salud del sistema y logs estructurados.
- **/i18n**: Etiquetas de estado de sistema (Nominal, Degraded, Critical).