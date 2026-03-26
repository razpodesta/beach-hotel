🧠 @metashark/cms-core: The Sovereign Data Engine
Versión: 3.0 (Payload 3.0 & Dual-Mode Ready)
Tipo: Núcleo de Gestión de Contenidos / Capa de Persistencia
Alcance: SSoT para el Hotel, Festival y Journal Editorial
Estatus: CRÍTICO. Punto de falla único para la integridad de datos.
1. Misión Arquitectónica
cms-core es el cerebro que orquesta la inteligencia de datos del ecosistema MetaShark. No es solo un repositorio de esquemas; es una Librería de Infraestructura que unifica las reglas de negocio, la seguridad multi-tenant y la persistencia en base de datos (Supabase/PostgreSQL).
Principios de Élite:
Dual-Mode Compliance: Diseñado para ser consumido por Next.js vía código fuente (Modo 1) y por scripts de infraestructura (Seeding/Migrations) vía artefactos compilados (Modo 2).
Aislamiento de Dominio: El CMS no conoce la existencia del frontend. Solo expone contratos de datos puros.
Soberanía de Tipos: Genera automáticamente el archivo payload-types.ts, actuando como el contrato inmutable para todo el monorepo.
2. Operación Dual-Mode (Cómore funciona)
Este paquete resuelve la fricción entre el desarrollo web y el runtime de servidor:
Para la App Web (Next.js 15): Se ignora la carpeta dist/. Next.js lee directamente src/ mediante los alias del tsconfig.base.json. Esto permite que cambios en las colecciones se reflejen instantáneamente en el frontend (HMR).
Para Infraestructura (Node.js): El build de Nx genera archivos .js reales en dist/. Esto permite que herramientas como el Genesis Engine (Seeder) o scripts de mantenimiento ejecuten la lógica del CMS sin necesidad de transpiladores externos.
3. El Grafo de Tareas (Nx Commands)
Acción	Comando	Propósito Forense
Build	nx build cms-core	Genera los artefactos físicos (JS + DTS) en ./dist. Obligatorio para scripts CLI.
Typecheck	nx typecheck cms-core	Valida la integridad estática y los contratos de Zod/Payload.
Lint	nx lint cms-core	Audita la higiene de código y las fronteras multi-tenant.
Test	nx test cms-core	Valida las reglas de acceso (Access.ts) y hooks de validación.
4. Guía de Extensión: Añadiendo Inteligencia
A. Nueva Colección
Crea el contrato en src/collections/{Nombre}.ts usando el tipo CollectionConfig.
Regla de Oro: Siempre inyecta multiTenantReadAccess y multiTenantWriteAccess para proteger la soberanía de los datos.
Registra la colección en el índice atómico de src/index.ts.
B. Ciclo de Vida de Tipos
Cada vez que modifiques un campo en una colección:
Asegúrate de que el servidor de Payload esté corriendo o ejecuta el build.
El archivo payload-types.ts se actualizará automáticamente.
Next.js detectará el cambio de tipo y alertará si hay inconsistencias en la UI.
5. Integración y Consumo (Best Practices)
Toda importación desde este paquete debe realizarse a través de los alias soberanos definidos en la constitución del monorepo:
code
TypeScript
// ✅ Correcto: Consumo de colecciones para lógica de servidor
import { Projects } from '@metashark/cms-core';

// ✅ Correcto: Consumo de configuración para inicialización de Payload
import config from '@metashark/cms-core/config';
6. Seguridad y Gobernanza
Prohibición de any: Todos los campos personalizados y hooks deben estar estrictamente tipados.
Higiene del Secreto: Nunca inyectes PAYLOAD_SECRET directamente en el código. El motor lee la variable de entorno validada por el sistema.
Resiliencia SSL: La conexión a base de datos utiliza un protocolo de relajación de certificados (rejectUnauthorized: false) exclusivo para entornos locales que conectan a través de poolers transaccionales.
Veredicto de Arquitectura:
cms-core es el ancla que garantiza que, sin importar cuánto crezca el Hotel o el Festival, los datos siempre serán íntegros, seguros y coherentes con la visión MetaShark.

---

