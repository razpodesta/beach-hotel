# Protocolo de Auditoría de Élite y Refactorización Holística
**Versión: 1.0**
**Estatus:** ACTIVO Y OBLIGATORIO
**Prioridad:** MÁXIMA

Este documento define el algoritmo mental y operativo que la IA debe ejecutar ante cualquier solicitud de corrección de bugs, auditoría o refactorización. No es una sugerencia; es un estándar de calidad innegociable.

## 1. Análisis Lógico y Algorítmico (El Núcleo)
**Objetivo:** Eficiencia Matemática y Simplicidad Elegante.

*   **Criterio de "Navaja de Ockham":** Antes de escribir código, cuestiona: ¿Es esta la forma más lógica y directa de resolver el problema?
*   **Cero Sobre-Ingeniería:** Rechaza soluciones complejas para problemas simples. La sofisticación está en la simplicidad.
*   **Performance de Élite:** Analiza la complejidad temporal (Big O) y espacial. Busca la baja latencia obsesivamente.
*   **Benchmarking Mental:** Compara la solución propuesta con los estándares de la industria (Google, Meta, Airbnb). Si el código no está a ese nivel, refactorízalo hasta que lo esté.

## 2. Visión Hiper-Holística (El Ecosistema)
**Objetivo:** Cero Regresiones y Coherencia Total.

*   **Radio de Impacto:** Nunca evalúes un archivo ("aparato") en aislamiento. Debes auditar:
    1.  **El Aparato Causante:** El archivo origen del bug o la lógica.
    2.  **Los Consumidores:** ¿Quién llama a esta función? (Componentes padres, API routes).
    3.  **Las Dependencias:** ¿Qué utilidades o stores usa? (Zustand, Hooks, Utils).
*   **Nivelación:** Si mejoras el aparato principal, **DEBES** nivelar y optimizar los aparatos relacionados para mantener la coherencia arquitectónica.

## 3. Erradicación de Hardcoding y Configuración
**Objetivo:** Flexibilidad y Seguridad.

*   **Prohibición de Valores Mágicos:** Está terminantemente prohibido dejar cadenas de texto, números mágicos, colores hex (fuera de tokens) o URLs quemadas en el código.
*   **Centralización:**
    *   Los textos van a diccionarios (`i18n`).
    *   Las configuraciones van a constantes o variables de entorno (`.env`).
    *   Los estilos van a variables CSS o clases semánticas de Tailwind (`theming`).

## 4. Internacionalización (i18n) Soberana
**Objetivo:** Escalabilidad Global sin Cuellos de Botella.

*   **Arquitectura Data-Driven:** Todo texto visible debe provenir de un diccionario inyectado o consumido vía hook.
*   **Pipeline Completo:** Si añades texto, debes entregar:
    1.  El componente actualizado.
    2.  El esquema de Zod actualizado (`dictionary.schema.ts`).
    3.  El JSON del diccionario actualizado (ej. `en-US.json`, `es-ES.json`).

## 5. Estándar de Entrega (The Artifact)
**Objetivo:** "Copy-Paste" en Producción con Confianza Ciega.

*   **Sin Abreviaciones:** Jamás entregues código con `// ... resto del código` o `// lógica existente`. Los archivos se entregan COMPLETOS.
*   **Full TSDoc:** Cada función, interfaz y componente exportado debe tener documentación JSDoc completa (`@param`, `@returns`, `@description`).
*   **Mensajes Claros:** La explicación del cambio debe ser técnica, precisa y directa. Sin ambigüedades.
*   **Clean Code:** Elimina imports no usados, variables muertas y `console.log` de depuración antes de entregar.

---
**Firma de Compromiso:**
Al procesar este archivo, el Asistente de IA certifica que ha internalizado estos 5 pilares y los aplicará recursivamente en cada interacción.


---


