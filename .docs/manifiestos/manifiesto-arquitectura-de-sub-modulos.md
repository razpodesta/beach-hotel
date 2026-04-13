📜 Manifiesto: Arquitectura de Sub-Módulos Soberanos (SMSA)
Versión: 1.0 (Enterprise Modular Standard)
Alcance: Estructura Interna de Workspaces @metashark/*
Estatus: MANDATORIO
1. Filosofía: "El Principio del Núcleo Fragmentado"
Cada Workspace de MetaShark Tech actuará como un ecosistema autónomo. En lugar de una estructura monolítica interna, dividiremos la lógica en Sub-Vías Soberanas organizadas por dominio técnico o proveedor. Esto permite una escalabilidad horizontal infinita dentro del mismo paquete sin contaminar el espacio de nombres global.
2. Anatomía de la Sub-Vía (Internal Topology)
Cada sub-módulo dentro de src/lib/ debe comportarse como una "mini-librería" que contiene:
Lógica (Logic): Implementación técnica pura.
Contrato (Schema): Esquemas de Zod específicos para ese sub-módulo.
Voz (i18n): Traducciones locales si el sub-módulo tiene mensajes propios.
Fachada (Barrel): Un archivo index.ts interno que exporta la API de ese módulo hacia el orquestador del Workspace.
3. Jerarquía de Carpetas (Ejemplo Comms Hub)
code
Text
packages/communication-dispatch-hub/
├── src/
│   ├── index.ts                 # Orquestador Supremo (Master Facade)
│   └── lib/
│       ├── core/                # Lógica de Orquestación General
│       ├── shared/              # Utilidades compartidas solo dentro del paquete
│       └── sub-modules/         # Directorio de Capacidades Especializadas
│           ├── resend-email/    # Capacidad: Email vía Resend
│           │   ├── logic/
│           │   ├── schemas/
│           │   └── index.ts
│           └── twilio-sms/      # Capacidad: SMS vía Twilio (Futuro)
│               ├── logic/
│               ├── schemas/
│               └── index.ts
4. Reglas de Oro de la Sub-Librería
Aislamiento de Fugas: El código de resend-email no puede importar nada de twilio-sms. La comunicación entre sub-módulos solo puede ocurrir a través de la capa core o la fachada raíz.
Contrato de Salida Único: El index.ts en la raíz del Workspace es el ÚNICO punto de entrada autorizado para la aplicación web. El Host nunca importa de /lib/sub-modules/... directamente; solo importa de @metashark/package-name.
Descubrimiento Dinámico: El orquestador de pre-construcción (MACS) debe ser capaz de profundizar en estas sub-rutas para recolectar fragmentos de diccionarios y esquemas.
Identidad de Error: Cada sub-módulo debe emitir errores con un prefijo identificativo (ej: [COMMS_RESEND_ERR]) para permitir un diagnóstico forense instantáneo.

---

