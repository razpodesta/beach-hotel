# Manifiesto de Arquitectura: "Código como Artefacto"
**Versión: 2.0**
**Fecha: 2025-11-07**

## 1. Misión

Este documento establece los principios de arquitectura y las convenciones de código inquebrantables para este portafolio. El objetivo no es solo construir un producto funcional, sino una pieza de software de élite: robusta, mantenible, escalable y que refleje la calidad profesional de mi trabajo. La excelencia no es negociable.

---

## 2. El Pilar Fundamental: Zod como Única Fuente de Verdad

El principio **Don't Repeat Yourself (DRY)** es la ley. Para lograrlo, toda la estructura de datos en esta aplicación **DEBE** ser definida como un esquema de Zod.

### 2.1. Regla de Oro: Esquema Primero, Tipo Después

Nunca se definirá un tipo (`type` o `interface`) manualmente si este describe una estructura de datos. En su lugar, el flujo de trabajo obligatorio es:

1.  **Definir el Esquema:** Crear un archivo en `src/lib/schemas/` que exporte un esquema de Zod. Este esquema define la "forma" y las reglas de validación de los datos.
2.  **Inferir el Tipo:** Exportar un tipo de TypeScript inferido directamente desde el esquema.

**Ejemplo Canónico (`contact.schema.ts`):**
```typescript
import { z } from 'zod';

// 1. Se define el esquema con sus reglas.
export const contactFormSchema = z.object({
  name: z.string().min(1, 'name_required'),
  email: z.string().email('email_invalid').min(1, 'email_required'),
  message: z.string().min(10, 'message_too_short'),
});

// 2. Se infiere y exporta el tipo. Este es el tipo que se usará en toda la aplicación.
export type ContactFormData = z.infer<typeof contactFormSchema>;
2.2. Aplicación
Esta regla se aplica a:
Formularios: Como se ve en contact.schema.ts.
Datos de Internacionalización (i18n): Como se ve en dictionary.schema.ts.
Datos Estructurados (SEO): Como se ve en seo.schema.ts para los esquemas de Schema.org.
(Futuro) Respuestas de API: Cualquier dato obtenido de una API externa DEBE ser validado (.parse()) contra un esquema Zod a su llegada.
3. Erradicación Total del Tipo any
El uso de any está estrictamente prohibido. Anula el propósito de TypeScript y es la antítesis de la calidad.
Para datos de tipo desconocido: Utiliza unknown y realiza una validación de tipo explícita (usando Zod o typeof) antes de usar la variable.
Para Módulos sin Tipos (ej. SVGs): Se utiliza un archivo de declaración (.d.ts) para proporcionar un tipado básico, como se ve en apps/portfolio-web/index.d.ts, evitando el uso explícito de any en el código de la aplicación.
Para Librerías de Terceros: Si una librería no proporciona tipos, es responsabilidad del desarrollador crear un archivo de declaración (.d.ts) para modelar las partes de la API que se utilizan.
4. Arquitectura de Componentes (SOLID y Cohesión)
4.1. Principio de Responsabilidad Única (SRP)
Nuestros componentes serán pequeños y especializados.
Componentes de Página (Orquestadores): Los archivos en src/app/[lang]/ (ej. page.tsx) son Componentes de Servidor cuya única responsabilidad es obtener datos y componer la UI ensamblando componentes de sección. No contienen lógica de renderizado compleja.
Componentes de Sección: Ubicados en src/components/sections/, cada uno maneja una porción de la UI de la página (HeroSection, ProjectsSection).
Componentes de UI: Ubicados en src/components/ui/, son los bloques de construcción más pequeños y reutilizables (ProjectCard, LanguageSwitcher).
4.2. Cohesión por Característica
Los componentes que pertenecen lógicamente a una misma característica se agrupan.
Ejemplo: Todos los componentes de sección exclusivos de la página de inicio residen en apps/portfolio-web/src/components/sections/homepage/.
5. Reglas de Importación (Límites de Módulo de Nx)
Para mantener la integridad arquitectónica del monorepo, las importaciones seguirán una regla estricta:
Importaciones Intra-Proyecto: Para importar un archivo que está dentro del mismo proyecto (portfolio-web), SE DEBEN usar rutas relativas.
code
TypeScript
// CORRECTO: Dentro de un componente en 'src/components/'
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
Importaciones Inter-Proyecto: El uso de alias de TypeScript (@/) se reserva para cuando un proyecto necesite importar desde otro, o para casos específicos definidos por el framework (como en los archivos de configuración raíz o para alias internos como @/components).
El cumplimiento de esta regla es obligatorio y está reforzado por ESLint (@nx/enforce-module-boundaries).

---

# Manifiesto de Arquitectura: "Código como Artefacto"
**Versión: 3.0**
**Fecha: 2025-11-09**

## 1. Misión
... (sin cambios) ...

---

## 2. El Pilar Fundamental: Zod como Única Fuente de Verdad
... (sin cambios) ...

---
## 3. Erradicación Total del Tipo any
... (sin cambios) ...

---
## 4. Arquitectura de Componentes (SOLID y Cohesión)
... (sin cambios) ...

---
## 5. Reglas de Importación (Límites de Módulo de Nx)
... (sin cambios) ...

---

## 6. Arquitectura de Contenido (i18n): Granularidad y Pre-construcción

Este proyecto adopta una estrategia de internacionalización (i18n) que trata el contenido como un artefacto de software de primera clase, sujeto a las mismas reglas de robustez, modularidad y validación que el resto del código.

### 6.1. Principio de Granularidad por Característica

Los archivos de diccionario monolíticos están prohibidos. En su lugar, todo el contenido de la UI (textos, etiquetas, etc.) **DEBE** ser segmentado en archivos JSON pequeños y enfocados, ubicados en `apps/portfolio-web/src/messages/{locale}/{feature}.json`.

*   **Ejemplo:** Los textos del footer para español residen en `src/messages/es-ES/footer.json`.
*   **Beneficio:** Este enfoque (Cohesión por Característica) permite a los desarrolladores modificar textos de una sección específica con la confianza de que no habrá efectos secundarios imprevistos en otras partes de la aplicación.

### 6.2. Arquitectura de Esquemas en Espejo

Cada archivo de mensaje granular **DEBE** tener un archivo de esquema de Zod correspondiente en `apps/portfolio-web/src/lib/schemas/messages/{feature}.schema.ts`.

*   **Ejemplo:** El contrato para `footer.json` es definido por `footer.schema.ts`.
*   **Garantía:** Esto asegura que cada fragmento de contenido es validado de forma independiente antes de ser integrado en el sistema.

### 6.3. Ensamblaje en Tiempo de Pre-construcción (`prebuild`)

La aplicación en tiempo de ejecución **NUNCA** leerá los archivos de mensajes granulares directamente. En su lugar, un script de Node.js (`scripts/prebuild-dictionaries.mjs`) se ejecuta automáticamente antes de los comandos `dev` y `build`.

*   **Responsabilidad del Script:**
    1.  Descubrir dinámicamente todos los archivos de mensajes para cada idioma.
    2.  Ensamblarlos en un único diccionario final por idioma (ej. `en-US.json`).
    3.  Guardar estos diccionarios completos en la carpeta `apps/portfolio-web/src/dictionaries`, que está versionada en `.gitignore`.
*   **Beneficio de Rendimiento y Seguridad:** Este proceso elimina la sobrecarga de leer múltiples archivos en tiempo de ejecución y previene que módulos del lado del servidor (como `fs`) se filtren accidentalmente en el bundle del cliente, garantizando la compatibilidad con plataformas como Vercel.

El `dictionary.schema.ts` principal actúa como el agregador final que importa y fusiona todos los esquemas granulares, sirviendo como el contrato definitivo contra el cual se validan los diccionarios ensamblados.

---

# Manifiesto de Arquitectura: "Código como Artefacto"
**Versión: 3.0**
**Fecha: 2025-11-09**

## 1. Misión

Este documento establece los principios de arquitectura y las convenciones de código inquebrantables para este portafolio. El objetivo no es solo construir un producto funcional, sino una pieza de software de élite: robusta, mantenible, escalable y que refleje la calidad profesional de mi trabajo. La excelencia no es negociable.

---

## 2. El Pilar Fundamental: Zod como Única Fuente de Verdad

El principio **Don't Repeat Yourself (DRY)** es la ley. Para lograrlo, toda la estructura de datos en esta aplicación **DEBE** ser definida como un esquema de Zod.

### 2.1. Regla de Oro: Esquema Primero, Tipo Después

Nunca se definirá un tipo (`type` o `interface`) manualmente si este describe una estructura de datos. En su lugar, el flujo de trabajo obligatorio es:

1.  **Definir el Esquema:** Crear un archivo en `src/lib/schemas/` que exporte un esquema de Zod. Este esquema define la "forma" y las reglas de validación de los datos.
2.  **Inferir el Tipo:** Exportar un tipo de TypeScript inferido directamente desde el esquema.

---

## 3. Arquitectura de Contenido (i18n): Granularidad y Pre-construcción

Este proyecto adopta una estrategia de internacionalización (i18n) que trata el contenido como un artefacto de software de primera clase, sujeto a las mismas reglas de robustez, modularidad y validación que el resto del código.

### 3.1. Principio de Granularidad por Característica

Los archivos de diccionario monolíticos están prohibidos. En su lugar, todo el contenido de la UI (textos, etiquetas, etc.) **DEBE** ser segmentado en archivos JSON pequeños y enfocados, ubicados en `apps/portfolio-web/src/messages/{locale}/{feature}.json`.

*   **Ejemplo:** Los textos del footer para español residen en `src/messages/es-ES/footer.json`.
*   **Beneficio:** Este enfoque (Cohesión por Característica) permite a los desarrolladores modificar textos de una sección específica con la confianza de que no habrá efectos secundarios imprevistos en otras partes de la aplicación.

### 3.2. Arquitectura de Esquemas en Espejo

Cada archivo de mensaje granular **DEBE** tener un archivo de esquema de Zod correspondiente en `apps/portfolio-web/src/lib/schemas/messages/{feature}.schema.ts`.

*   **Ejemplo:** El contrato para `footer.json` es definido por `footer.schema.ts`.
*   **Garantía:** Esto asegura que cada fragmento de contenido es validado de forma independiente antes de ser integrado en el sistema.

### 3.3. Ensamblaje en Tiempo de Pre-construcción (`prebuild`)

La aplicación en tiempo de ejecución **NUNCA** leerá los archivos de mensajes granulares directamente. En su lugar, un script de Node.js (`scripts/prebuild-dictionaries.mjs`) se ejecuta automáticamente antes de los comandos `dev` y `build`.

*   **Responsabilidad del Script:**
    1.  Descubrir dinámicamente todos los archivos de mensajes para cada idioma.
    2.  Ensamblarlos en un único diccionario final por idioma (ej. `en-US.json`).
    3.  Guardar estos diccionarios completos en la carpeta `apps/portfolio-web/src/dictionaries`, que **NO** está versionada en Git.
*   **Beneficio de Rendimiento y Seguridad:** Este proceso elimina la sobrecarga de leer múltiples archivos en tiempo de ejecución y previene que módulos del lado del servidor (como `fs`) se filtren accidentalmente en el bundle del cliente, garantizando la compatibilidad con plataformas como Vercel.

El `dictionary.schema.ts` principal actúa como el agregador final que importa y fusiona todos los esquemas granulares, sirviendo como el contrato definitivo contra el cual se validan los diccionarios ensamblados.

... (Secciones 4, 5 y 6 del manifiesto original continúan aquí)

---


