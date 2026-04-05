🏨 Beach Hotel Canasvieiras
![alt text](https://img.shields.io/badge/Next.js-15.2.9-black.svg?logo=next.js)

![alt text](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg?logo=typescript)

![alt text](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?logo=tailwind-css)

![alt text](https://img.shields.io/badge/Nx-Monorepo-blueviolet.svg?logo=nx)

"Donde la hospitalidad de alto rendimiento se encuentra con la ingeniería de datos a gran escala."

Este repositorio constituye el **motor digital** soberano del Beach Hotel Canasvieiras. Hemos superado el concepto de "sitio web" para construir un ecosistema SaaS de hospitalidad capaz de gestionar reservas individuales y promocion personalidada para agencias de viajes y operadores mayoristas.

🏛️ Visión Ejecutiva
La plataforma es un Activo Digital Escalable orquestado por un núcleo tecnológico unificado. La estrategia de negocio se divide en cuatro silos operacionales de alta eficiencia:


Mermaid
graph TD
    A[Core Engine: Payload 3.0 + Supabase] --> B[Revenue: Yield & OTA Integration]
    A --> C[Partner Network: B2B/Wholesale]
    A --> D[Marketing Cloud: Data Ingestion]
    A --> E[Communications: Comms Hub]
    
    subgraph "Operational Ecosystem"
        B --> B1[Flash Sales & Last Minute]
        B --> B2[Channel Manager: Booking, Decolar, Expedia]
        C --> C1[Agency Management & Net Rates]
        C --> C2[Commissions & Ledger]
        D --> D1[Automated Data Pipeline]
        D --> D2[Mass Dispatch Engine]
        E --> E1[System Alerts & Forensics]
        E --> E2[Node-to-Node Messaging]
    end

🧩 Funcionalidades Implementadas
1. Motor de Revenue & Distribución 
Yield Management Industrial: Algoritmos de precios dinámicos y gestión de ofertas Flash/Enterprise con control de stock en tiempo real.

OTA Integration Hub: Motor centralizado para la sincronización bidireccional de disponibilidad y tarifas con OTAs de mercado (Booking.com, Decolar, Expedia, Airbnb) evitando el sobre-booking mediante webhooks.

Inventario en Riesgo: Telemetría avanzada que identifica nodos de inventario próximos a agotarse, disparando alertas automáticas al Hub de Comunicaciones.

2. Red de Aliados B2B
Partner Network Management (PRM): Sistema integral para agencias de viajes mayoristas con perfiles, validación fiscal (Tax ID verificados) y gestión de registros comerciales.

Tarifas Netas: Motor de cálculo de precios B2B que aplica descuentos escalonados basados en volumen y nivel de credibilidad (Trust Score).

Portal de Agentes: Espacio exclusivo para consultores donde gestionan reservas, consultan comisiones devengadas y descargan material promocional personalizado (Flyer Synth).

3. Marketing Cloud & Ingesta de Datos
Universal Ingestion Vault: Pipeline de ingesta multi-modal capaz de procesar Excel, CSV, audios y transcripciones, normalizando la información hacia el contrato SSoT (Single Source of Truth).

Campaign Orchestration Engine: Despacho masivo de comunicaciones (transaccionales y promocionales) con trazabilidad de latencia y monitoreo de Open Rate.

Deduplicación Forense: Limpieza automática de bases de datos externas para evitar redundancias de clientes antes de la inyección en el CRM.

4. Gamificación & Reputación Ascension Engine: Motor matemático de XP que clasifica a los usuarios en linajes (Architects, Weavers, Anomalies).

Showcase de Artefactos (WebGL): Galería interactiva 3D que exhibe los logros digitales del huésped, inyectando un componente de coleccionismo y engagement al perfil de usuario.

🚀 Potencialidades Futuras (Roadmap Estratégico)
Integración con IA Predictiva: Implementación de modelos de ML para predecir picos de demanda y ajustar precios de forma automática antes de que el mercado reaccione.

Wallet Web3 : Acuñación de artefactos digitales como NFTs en redes L2, permitiendo que los huéspedes posean activos de valor real dentro del ecosistema.

App Nativa (Capacitor): Empaquetado de la PWA para presencia directa en App Store y Google Play sin necesidad de desarrollo extra.

Reserva de Conserjería 24/7: Automatización mediante IA de servicios adicionales (transfers, tours, experiencias gastronómicas) integrados directamente en el flujo de reserva del huésped.


🛠 **Stack Tecnológico**
Frontend: Next.js 15 (App Router), React 19, TypeScript 5.9.
Estilos: Tailwind CSS v4, CSS Variables semánticas.
Backend/DB: Supabase (PostgreSQL 17.6) + Transaction Pooler.
CMS: Payload 3.0 (Configuración "Source-First").
Infraestructura: Nx Monorepo, pnpm Workspaces, CI/CD automatizado vía Vercel.

🚀 **Guía de Desarrollo**

Pre-requisitos
Node.js v20+
pnpm v10+

Comandos Críticos

Bash
# 1. Instalación del ecosistema
pnpm install

# 2. Sincronización de esquemas y artefactos del CMS
pnpm run prebuild:web

# 3. Servidor de desarrollo con bypass de seguridad
pnpm run dev

# 4. Auditoría forense de configuración
pnpm run lint

© 2026 MetaShark Tech.

Arquitectura y Estrategia forjada por Raz Podestá | MetaShark Tech.