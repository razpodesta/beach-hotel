# Convenciones: Protocolo 33 (Gamification Engine)
**Versión:** 1.0
**Tipo:** Motor Lógico / Reglas de Negocio

## 1. Propósito
Centralizar toda la lógica, constantes y tipos relacionados con el sistema de gamificación "Protocolo 33". Esta librería es la **Única Fuente de Verdad** sobre qué artefactos existen, cuánto valen y cómo se calcula el nivel de un usuario.

## 2. Reglas de Implementación
1.  **Isomorfismo Puro:** El núcleo (`src/core`) NO debe depender de React, Node.js (fs, http) ni bases de datos. Debe ser JavaScript puro ejecutable en cualquier entorno (Browser, Server, Edge).
2.  **Inmutabilidad:** Las definiciones de Artefactos y Tablas de XP son constantes inmutables (`as const`).
3.  **Tipado Estricto:** No se permiten "magic strings". Todo ID de artefacto, rareza o casa debe estar tipado mediante un Union Type derivado de las constantes.

## 3. Estructura de Datos
*   **Houses:** Architects, Weavers, Anomalies.
*   **Rarity:** Common, Rare, Legendary, Mythic, Unique.
*   **Currency:** RazToken (RZB).
PASO 2.2: Limpieza de Boilerplate (Cirugía)
El paquete se generó como una librería de React. Debemos eliminar los archivos .tsx por defecto para convertirlo en una librería de lógica pura (o híbrida en el futuro).
Instrucción:
Elimina el archivo packages/protocol-33/src/lib/protocol-33.tsx y su test asociado. Vamos a crear nuevos archivos .ts.

---


