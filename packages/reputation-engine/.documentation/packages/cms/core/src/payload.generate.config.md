# Documento Conceptual: Motor de Síntesis de Tipos (Isolated Synthesis Engine)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/packages/cms/core/src/payload.generate.config.md`
- **Ruta Origen:** `packages/cms/core/src/payload.generate.config.ts`
- **Tipo de Aparato:** Orquestador de Build Estático / Generador de AST (Abstract Syntax Tree).
- **Silo / Dominio:** Infraestructura Core (Sovereign Data Engine).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato es el escudo protector del proceso de Integración Continua (CI/CD) en Vercel. En Payload CMS 3.0, el proceso de inferir los tipos de TypeScript exige instanciar la configuración de la base de datos. En entornos *Serverless*, esto provoca latencia, bloqueos (*Deadlocks*) y errores letales si la base de datos de producción restringe conexiones durante el *build*.

`payload.generate.config.ts` actúa como un **"Gemelo Digital Vacío" (Digital Twin Dummy)** de la configuración real del CMS (`payload.config.ts`). Su único propósito es alimentar al script de generación (`pnpm sync:types`) con la estructura de las colecciones para que pueda transmutar los modelos en interfaces TypeScript puras (`payload-types.ts`), las cuales serán consumidas por todo el monorepo.

## 3. ANATOMÍA FUNCIONAL
1. **El Adaptador Fantasma (Phantom Adapter):** A diferencia de la configuración real, inyecta un `postgresAdapter` con credenciales nulas (`postgres://ghost:ghost...`) y establece explícitamente `idType: 'uuid'`. Esto satisface el requerimiento estructural del motor de AST (evitando el error `TypeError: Cannot read properties of undefined (reading 'defaultIDType')`) sin abrir un solo socket TCP.
2. **Purga de Dependencias de Runtime:** Excluye intencionalmente el editor Lexical, los adaptadores de Storage (S3) y los plugins de UI. Al eliminar estas cargas pesadas, el tiempo de síntesis se reduce a milisegundos.
3. **Mapeo de la Cúspide de Datos (The Sovereign Map):** Es el único archivo autorizado para importar todas las definiciones físicas de colecciones (Tenants, Users, Media, etc.) estrictamente para su análisis estático.
4. **Higiene de Logs (Linter Pure):** Utiliza `console.info` para inyectar trazas (Trace IDs) en el flujo de salida de Vercel, cumpliendo con las reglas de ESLint v9 y manteniendo limpio el canal de errores.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato materializa el **Pilar XIII: Build Isolation Guard**. Asegura que el código TypeScript del frontend esté fuertemente tipado (SSoT) *antes* de que el compilador de Next.js empiece su trabajo, sin arriesgar la estabilidad de la red.

---

