# Documento Conceptual: Motor de Síntesis de Tipos (Isolated Synthesis Engine)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/packages/cms/core/src/payload.generate.config.md`
- **Ruta Origen:** `packages/cms/core/src/payload.generate.config.ts`
- **Tipo de Aparato:** Orquestador de Build Estático / Generador de AST (Abstract Syntax Tree).
- **Silo / Dominio:** Infraestructura Core (Sovereign Data Engine).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato es el escudo protector del proceso de Integración Continua (CI/CD) en Vercel. En Payload CMS 3.0, el proceso normal de extraer tipos de TypeScript requiere arrancar el motor de base de datos completo. En entornos *Serverless*, esto provoca latencia de red, bloqueos (*Deadlocks*) y errores letales si la base de datos de producción no está accesible durante el *build*.

`payload.generate.config.ts` actúa como un **"Gemelo Digital Vacío" (Digital Twin Dummy)** de la configuración real del CMS (`payload.config.ts`). Su único propósito es alimentar al script de generación (`sovereign-prebuild.ts` -> `pnpm sync:types`) con la estructura de las colecciones para que pueda transmutar los modelos en interfaces TypeScript puras (`payload-types.ts`), las cuales serán consumidas por todo el monorepo.

## 3. ANATOMÍA FUNCIONAL
1. **El Adaptador Fantasma (Phantom Adapter):** A diferencia de la configuración real, inyecta un `postgresAdapter` con credenciales nulas (`postgres://ghost:ghost...`) y establece explícitamente `idType: 'uuid'`. Esto satisface el requerimiento estructural del motor de generación de AST (evitando el error `reading 'defaultIDType'`) sin intentar abrir un solo socket TCP hacia Supabase.

2. **Purga de Dependencias de Runtime:** Excluye intencionalmente el editor Lexical, los adaptadores de Storage (S3) y los plugins de UI (Dashboard). Al eliminar estas cargas pesadas, el tiempo de síntesis de tipos se reduce de segundos a milisegundos.

3. **Mapeo de la Cúspide de Datos (The Sovereign Map):** Es el único archivo que importa todas las definiciones físicas de colecciones (Tenants, Users, Media, Offers, Ingestions) estrictamente para su análisis estático.

4. **Higiene de Logs (Linter Pure):** Utiliza `console.info` para inyectar trazas (Trace IDs) en el flujo estándar de salida (stdout) de Vercel, cumpliendo con las reglas de ESLint v9 y permitiendo auditorías de los tiempos de *build* sin contaminar el *stderr*.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato materializa el **Pilar XIII: Build Isolation Guard**. 
Sin él, el monorepo sería incapaz de compilarse en la nube de forma estable, resultando en fallos catastróficos por *Timeouts* de conexión a base de datos durante la fase de despliegue. A nivel de arquitectura, asegura que el código TypeScript del frontend y los servidores esté fuertemente tipado (SSoT) *antes* de que cualquier compilador (SWC/Next.js) empiece su trabajo.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Generación Selectiva de Tipos (Granular Synthesis):**
   - *Justificación:* Actualmente, este archivo carga el 100% de las colecciones. En un futuro, si MetaShark evoluciona a 100+ colecciones, el tiempo de análisis crecerá. Podría implementarse una bandera de entorno que le indique al generador compilar solo el subconjunto de tipos afectados por el último *commit* (Incremental Type Gen).
   
2. **Mocking de Relaciones Circulares:**
   - *Justificación:* Si en el futuro dos colecciones desarrollan dependencias circulares complejas (ej. `Agents` depende de `Agencies`, y `Agencies` de `Agents`), el generador podría entrar en bucles infinitos. Se podría inyectar un *Mock Schema Resolver* que rompa estos ciclos artificialmente solo durante la fase de *Build*.

   ---

