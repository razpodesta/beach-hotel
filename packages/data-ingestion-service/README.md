# 🧪 @metashark/data-ingestion-service
**Versión:** 1.0 (Industrial Shell)
**Silo:** C (Intelligence)

## 🎯 Escopo de Especialización
Este workspace es el **Alquimista de Datos** del ecosistema. Su responsabilidad única es la ingesta, limpieza y normalización de información proveniente de fuentes heterogéneas (Excel, CSV, Webhooks de WhatsApp, Audio Buffers) hacia el contrato unificado de la plataforma.

## 🚀 Capacidades SaaS & Reusabilidad
- **Binary Transmutation Engine:** Procesador de alta velocidad para archivos pesados (xlsx/csv) con validación de filas en tiempo real.
- **Data Normalizer:** Algoritmos para la estandarización de Unicode, teléfonos y correos electrónicos.
- **Forensic Anomaly Report:** Generación de reportes técnicos sobre datos corruptos o duplicados detectados en el pipeline.

## 🤖 System Prompt para IA
"Actúa como el Alchemist Engineer de MetaShark. Este paquete es agnóstico a la UI y a la persistencia. Solo procesa flujos binarios y strings. Toda operación debe reportar métricas de rendimiento (Throughput) y cumplir con el Pilar X de higiene de código."

## 📜 Contratos SSoT
- **/core**: Motores de parsing y lógica de deduplicación.
- **/schemas**: Definición de la 'Audience Node' y contratos de respuesta de ingesta.
- **/i18n**: Mensajes de estado del pipeline (Wait, Processing, Success, Error).