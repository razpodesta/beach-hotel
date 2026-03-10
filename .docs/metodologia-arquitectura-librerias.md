# Metodología de Arquitectura: Protocolo de Librerías Soberanas
**Versión:** 1.0
**Tipo:** Mandatorio / Constitucional
**Objetivo:** Atomización, Reutilización y Portabilidad Extrema.

## 1. Misión
Transformar cada funcionalidad algorítmica, lógica de negocio o utilidad UI en un **Módulo Atómico y Soberano** (Librería).
El código no "pertenece" a una aplicación (`apps/`), sino que es "consumido" por ella. Las aplicaciones son meros orquestadores; la inteligencia reside en las librerías (`packages/`).

## 2. Principios de la Librería Soberana

### I. Atomicidad Funcional
Una librería hace **UNA** cosa y la hace perfecta.
*   ❌ **Incorrecto:** `packages/utils` (Cajón de sastre).
*   ✅ **Correcto:** `packages/auth-shield`, `packages/date-formatter`, `packages/currency-math`.

### II. Independencia Radical (Plug & Play)
Una librería **NUNCA** debe importar código desde una aplicación (`apps/`).
*   Debe ser agnóstica al framework anfitrión siempre que sea posible.
*   Debe funcionar tanto en este monorepo como instalada vía `pnpm` en un proyecto externo totalmente nuevo.

### III. Contrato Estricto (Tipado Soberano)
*   **Entradas y Salidas:** Todo debe estar tipado con TypeScript estricto.
*   **Sin `any`:** El uso de `any` es motivo de rechazo inmediato.
*   **Interfaces Exportadas:** La librería debe exportar sus interfaces en `index.ts` o `types.ts` para que el consumidor sepa exactamente qué esperar.

## 3. Estructura Canónica de una Librería

Cada paquete en `packages/` debe seguir estrictamente esta anatomía:

```text
packages/nombre-libreria/
├── .docs/
│   └── CONVENCIONES.md      <-- OBLIGATORIO: Reglas específicas de esta lib
├── src/
│   ├── core/                <-- Lógica pura, algoritmos
│   ├── adapters/            <-- Conexiones (ej: a Supabase, Firebase, Local)
│   ├── types/               <-- Definiciones de TypeScript / Zod
│   └── index.ts             <-- Único punto de entrada (Barrel file)
├── README.md                <-- Documentación de uso (Install & Usage)
├── package.json             <-- Definición de dependencias aisladas
└── tsconfig.json            <-- Configuración estricta
4. Documentación Obligatoria (.docs/CONVENCIONES.md)
Cada librería DEBE contener un archivo CONVENCIONES.md que especifique:
Sintaxis: Reglas de estilo particulares si difieren del estándar global.
Manejo de Errores: ¿Lanza excepciones o retorna objetos Result<T, E>?
Variables de Entorno: Qué .env necesita para funcionar (ej: AUTH_SECRET).
Dependencias Peer: Qué librerías espera que el consumidor provea (ej: react, sequelize).
5. Flujo de Migración y Creación
Cuando se detecta una lógica reutilizable (ej: Autenticación):
Extracción: Se retira el código de apps/cms-api/....
Creación: Se genera packages/auth-shield usando nx g @nx/js:lib.
Refactorización: Se limpia el código, se eliminan acoplamientos y se endurecen los tipos.
Documentación: Se crean README.md y CONVENTIONS.md.
Consumo: La app importa desde @portfolio/auth-shield.
6. Publicabilidad
La arquitectura debe asumir que en cualquier momento ejecutaremos npm publish. Por tanto:
No usar rutas relativas que salgan del paquete (../../).
Definir correctamente main, types y exports en package.json.
Firma de Compromiso:
Cualquier código nuevo que implique lógica de negocio o utilidad compartida se creará bajo este protocolo.

---

