# @metashark-cms/core

El **Núcleo Arquitectónico** del CMS (Content Management System) basado en Payload v3. Esta librería actúa como la fuente de verdad inmutable para las colecciones, la configuración del motor y los tipos de datos compartidos en todo el ecosistema MetaShark.

## 🏛️ Filosofía Arquitectónica

Este módulo sigue el **Protocolo de Librerías Soberanas**:
*   **Atomicidad:** Gestiona exclusivamente la configuración y esquemas del CMS.
*   **Independencia:** No conoce detalles de la capa de presentación (`portfolio-web`).
*   **SSoT (Single Source of Truth):** Todas las definiciones de datos (Collections) residen aquí, garantizando que el backend y el frontend hablen el mismo lenguaje tipado.

## 🛠️ Comandos de Mantenimiento

Utilizamos el sistema de orquestación de **Nx**:

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Build** | `nx build @metashark-cms/core` | Transpila el código fuente a ESM y genera definiciones de tipo (`.d.ts`). |
| **Test** | `nx test @metashark-cms/core` | Ejecuta la suite de pruebas unitarias mediante Jest. |
| **Lint** | `nx lint @metashark-cms/core` | Ejecuta el auditor de calidad de código y fronteras de módulo. |
| **Typecheck**| `nx typecheck @metashark-cms/core` | Valida la integridad de los tipos sin generar archivos. |

## 🚀 Integración en Apps (Consumo)

Para consumir esta librería desde otras aplicaciones (ej. `portfolio-web`), asegúrate de importar solo desde los puntos de entrada exportados en `src/index.ts` o los alias definidos en `tsconfig.base.json`:

// ✅ Correcto: Consumo vía alias
import { Projects } from '@metashark-cms/core/collections';

📦 Desarrollo y Extensión
Añadir una nueva Colección
Crea un nuevo archivo en src/collections/.
Exporta la configuración del tipo CollectionConfig.
Registra la nueva colección en src/collections/index.ts (Barrel file).
Ejecuta nx build @metashark-cms/core para que los cambios sean visibles en el resto del monorepo.
Seguridad y Validación
Toda modificación en los esquemas debe respetar las validaciones de Zod y el contrato de Payload CMS.
No se permite el uso de any. Toda colección debe estar estrictamente tipada.

---

