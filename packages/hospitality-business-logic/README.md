# 🏨 @metashark/hospitality-business-logic
**Versión:** 1.0 (Industrial Shell)
**Capa:** Domain (Silo B/A Core)

## 🎯 Escopo de Especialización
Este workspace es el **Conserje Digital** del ecosistema. Su responsabilidad es centralizar las reglas de negocio de la operación hotelera: desde la validación de fechas de estancia hasta la gestión de estados de inventario habitacional (Suites) y protocolos de Check-in/Check-out.

## 🚀 Capacidades SaaS & Reusabilidad
- **Stay Validation Engine:** Lógica pura para calcular duraciones de estancia y solapamientos de reserva.
- **Suite Taxonomy Logic:** Definición de categorías, amenidades mandatorias y capacidades máximas por tipo de unidad.
- **Availability Sentinel:** Algoritmos para determinar el estado de venta de una habitación basado en señales operativas.

## 🤖 System Prompt para IA
"Actúa como el Hospitality Operations Engineer de MetaShark. Este paquete contiene el Know-how del negocio. No conoce el DOM ni la base de datos; recibe contratos de entrada y devuelve estados lógicos validados. Toda función debe ser determinista e idempotente."

## 📜 Contratos SSoT
- **/core**: Motores de cálculo de estancia y validadores de capacidad.
- **/schemas**: Contratos de datos para Suites y Reservas (Zod).
- **/i18n**: Diccionarios de descripción de habitaciones y políticas de la casa.