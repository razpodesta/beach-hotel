# Manifiesto de Pruebas: El Espejo de la Calidad
**Versión: 1.0**
**Fecha: 2025-11-19**

## 1. Filosofía: "Si Existe, se Refleja"

Este manifiesto establece la disciplina inquebrantable para las pruebas en este ecosistema. Las pruebas no son un apéndice; son un **gemelo digital** de nuestro código fuente. Cada pieza de lógica, cada componente de UI, cada función de negocio debe tener su reflejo en el universo de las pruebas.

Nuestra filosofía se basa en tres pilares:

1.  **Aislamiento Arquitectónico:** El código fuente (`src`) y el código de pruebas (`specs`) deben vivir en universos paralelos pero estructuralmente idénticos. Nunca se mezclarán.
2.  **Visibilidad Total:** La estructura de pruebas debe ser un mapa legible de todo el monorepo, permitiendo a cualquier arquitecto evaluar la cobertura y la calidad de un solo vistazo.
3.  **Ejecución Soberana:** La totalidad de las pruebas del ecosistema debe poder ejecutarse con un único y simple comando desde la raíz, garantizando una integración continua (CI) robusta y predecible.

---

## 2. El Principio Rector: La Estructura de Espejo (`/specs`)

Toda la lógica de pruebas, sin excepción, **DEBE** residir en un único directorio `specs/` en la raíz del monorepo. Este directorio replicará la estructura exacta de los directorios `apps/` y `packages/`.

**Estructura Canónica:**
portafolio/
├── apps/
│ └── cms-admin/
│ └── src/
│ └── shared/
│ └── components/
│ └── .../Logo/index.tsx
│
└── tests/ <-- EL ESPEJO DE CALIDAD
└── apps/
└── cms-admin/
└── src/
└── shared/
└── components/
└── .../Logo/Logo.spec.tsx

**Beneficios Inquebrantables de esta Arquitectura:**

*   **Separación Pura de Intereses:** El código de producción (`apps`, `packages`) permanece 100% limpio de artefactos de prueba. Esto simplifica drásticamente la configuración de builds y previene el empaquetado accidental de código de prueba en el bundle final.
*   **Configuración Simplificada:** Los archivos `jest.config.ts` de cada proyecto se vuelven triviales. Solo necesitan apuntar al directorio `specs/` correspondiente a su "reflejo", en lugar de buscar archivos `*.spec.ts` dispersos por todo el `src`.
*   **Gobernanza Centralizada:** Permite aplicar configuraciones de ESLint o TypeScript específicas para el entorno de pruebas de forma global y sin esfuerzo, apuntando únicamente al directorio `specs/`.

---

## 3. El Arsenal de Pruebas y la Estrategia de Mocking

Nuestra estrategia se basa en la reutilización y la soberanía.

1.  **El Arsenal Central (`@portfolio/testing-utils`):**
    *   Toda utilidad de prueba compartida (factories de datos con Faker, `customRender` para React, mocks de MSW) **DEBE** residir en la librería `@portfolio/testing-utils`.
    *   Se prohíbe la creación de `customRenders` o factories duplicadas dentro de los workspaces de las aplicaciones.

2.  **Mocking Soberano (MSW):**
    *   Para las pruebas de UI que involucran peticiones de red (GraphQL, REST), el uso de **Mock Service Worker (MSW)** es obligatorio.
    *   Los `handlers` de MSW se definirán en `@portfolio/testing-utils` y se activarán globalmente en el `jest.setup.ts` de cada aplicación, garantizando que las pruebas de UI nunca dependan de un servidor real.

---

## 4. Ejecución y Flujo de Trabajo

La estructura de espejo nos permite una ejecución de pruebas simple y poderosa.

*   **Ejecución Global:** Para ejecutar todas las pruebas del monorepo, el único comando soberano es:
    ```bash
    pnpm nx run-many --target=test
    ```

*   **Ejecución por Proyecto:** Para ejecutar las pruebas de un proyecto específico (ej. `cms-admin`), se utilizará:
    ```bash
    pnpm nx test cms-admin
    ```

Este flujo de trabajo se integrará en nuestro pipeline de CI/CD para garantizar que ningún código que no pase su reflejo en el "Espejo de Calidad" pueda llegar a producción.

---

## 5. Reglas Inquebrantables

1.  **CERO archivos `.spec.ts` o `.test.ts` dentro de los directorios `apps/` o `packages/`.** Sin excepciones.
2.  Toda prueba de componente React **DEBE** utilizar el `customRender` exportado desde `@portfolio/testing-utils`.
3.  Las pruebas **DEBEN** priorizar selectores de accesibilidad (`getByRole`, `getByLabelText`, etc.) sobre `getByTestId`.
4.  Toda simulación de API en pruebas de frontend **DEBE** realizarse a través de los handlers de MSW.

---

# Manifiesto de Pruebas: El Espejo de la Calidad
**Versión: 1.1**
**Fecha: 2025-11-20**

## 1. Filosofía: "Si Existe, se Refleja"
... (sin cambios) ...
---
## 2. El Principio Rector: La Estructura de Espejo (`/tests`)

Toda la lógica de pruebas, sin excepción, **DEBE** residir en un único directorio `tests/` en la raíz del monorepo. Este directorio replicará la estructura exacta de los directorios `apps/` y `packages/`.

---

