# 🤝 @metashark/partner-management-system
**Versión:** 1.0 (Industrial Shell)
**Silo:** B (Partners)

## 🎯 Escopo de Especialización
Este workspace es el **Nexus de Alianzas Comerciales**. Su responsabilidad única es gestionar el ciclo de vida de los Partners (Agencias y Operadores): desde el Onboarding legal con validación fiscal internacional hasta el motor de cálculo de comisiones y el índice de credibilidad (Trust Score).

## 🚀 Capacidades SaaS & Reusabilidad
- **Tax-ID Multi-Country Validator:** Lógica para normalizar y validar identificadores fiscales (CNPJ, RUT, VAT) por jurisdicción.
- **Yield Attribution Logic:** Algoritmos para asignar transacciones a nodos de agencia y calcular rentabilidades netas.
- **Trust Score Reactor:** Motor que ajusta la reputación de los aliados basado en la calidad de sus operaciones y conversiones.

## 🤖 System Prompt para IA
"Actúa como el Partner Relations Engineer de MetaShark. Este paquete es puro, no conoce el DOM. Solo procesa identidades corporativas, flujos financieros y contratos de cumplimiento (KYB). Toda lógica debe ser auditable y emitir trazas de telemetría."

## 📜 Contratos SSoT
- **/core**: Motores de cálculo de comisiones y validadores KYB.
- **/schemas**: Leyes de registro corporativo y perfiles de agencia (Zod).
- **/i18n**: Diccionarios de formularios de registro y términos B2B.