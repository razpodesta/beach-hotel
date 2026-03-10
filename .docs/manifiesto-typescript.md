# Manifiesto de Configuración TypeScript: La Constitución del Código
**Versión:** 2.0 (Sincronización Holística)
**Estatus:** OBLIGATORIO

## 1. Filosofía: "Dos Mundos, Una Ley"
El monorepo habita en dos ecosistemas simultáneos que requieren estrategias de compilación distintas pero coherentes:
1.  **El Mundo del Navegador (Frontend):** Gobernado por Next.js. Utiliza la resolución `bundler` para máxima flexibilidad con paquetes modernos.
2.  **El Mundo del Servidor (Backend/Libs):** Gobernado por Node.js. Utiliza la resolución `nodenext` para cumplimiento estricto de ESM (ECMAScript Modules).

## 2. La Constitución Base (`tsconfig.base.json`)
Es la única fuente de verdad para:
*   **Alias de Rutas (`paths`):** Centralizados aquí. Ningún proyecto hijo debe redefinir paths globales.
*   **Estricticidad (`strict`):** Activada al 100%. `noImplicitAny` es ley.
*   **Librerías Base (`lib`):** Se definen las capacidades mínimas del entorno (`es2022`).

## 3. Estrategia de Resolución de Módulos
*   **Apps Next.js (`portfolio-web`, `cms-admin`):**
    *   `"moduleResolution": "bundler"`
    *   Permite importar tipos e interfaces de librerías sin extensiones `.js` explícitas cuando el empaquetador (Webpack/Turbopack) lo maneja.
*   **APIs y Librerías (`cms-api`, `packages/*`):**
    *   `"moduleResolution": "nodenext"`
    *   Prepara el código para el futuro estándar de Node.js, exigiendo extensiones explícitas o exports definidos en `package.json`.

## 4. Reglas de Higiene
1.  **Sin Sobrescritura de Paths:** Los proyectos hijos heredan los paths. No los duplican.
2.  **Referencias de Proyecto:** Se utilizan `references` para optimizar el tiempo de compilación (Incremental Builds).
3.  **Aislamiento de Tests:** Los archivos de prueba se excluyen de la compilación de producción (`exclude`) pero se incluyen en el contexto de prueba global.

---


