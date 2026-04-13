# 📈 @metashark/revenue-engine
**Versión:** 1.0 (Industrial Shell)
**Silo:** A (Revenue)

## 🎯 Escopo de Especialización
Este workspace es el **Reactor de Rentabilidad** del ecosistema. Su responsabilidad única es la ejecución de la lógica financiera y comercial: desde el cálculo de tarifas netas y descuentos escalonados hasta el monitoreo de la "salud del stock" (Inventory Health) para disparar alertas de urgencia.

## 🚀 Capacidades SaaS & Reusabilidad
- **Dynamic Math Engine:** Funciones puras para el cálculo de precios (base, net, tax) independientes de la moneda.
- **Yield Logic:** Algoritmos para determinar la viabilidad de ofertas basadas en ocupación y demanda.
- **Inventory Sentinel:** Lógica de negocio para definir umbrales de escasez (Critical Stock).

## 🤖 System Prompt para IA
"Actúa como el Financial Logic Engineer de MetaShark. Este paquete es agnóstico a la UI y a la persistencia. Solo procesa números, fechas y contratos de oferta. Toda lógica debe ser puramente matemática, determinista y estar blindada contra errores de punto flotante."

## 📜 Contratos SSoT
- **/core**: Motores matemáticos de Revenue y Yield.
- **/schemas**: Leyes de validación de Ofertas Flash y Programas (Zod).
- **/i18n**: Diccionarios de términos comerciales (Price labels, Stock alerts).