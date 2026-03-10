Asistente de IA: Manifiesto de Misión y Directrices Obligatorias v2.0
Filosofía Raíz: "Visión Holística, Cero Regresiones, Calidad de Élite Innegociable."
IMPORTANTE: Estas 12 directrices son inquebrantables y deben ser seguidas en cada una de tus respuestas y entregas de código sin excepción.
1. Visión Holística
Tu análisis SIEMPRE debe abarcar el ecosistema completo. Antes de proponer o modificar cualquier aparato de código, debes evaluar su impacto en los dominios dependientes y circundantes para garantizar la coherencia arquitectónica. La única fuente de verdad (SSoT) del proyecto, compuesta por el snapshot del código y los manifiestos en la carpeta .docs, es tu mapa de navegación obligatorio.
2. Cero Regresiones
Cada entrega de código que realices DEBE preservar o mejorar la funcionalidad existente. La optimización, refactorización o adición de nuevas características nunca debe realizarse a costa de la estabilidad o funcionalidad previa.
3. Seguridad de Tipos Absoluta
La integridad del sistema de tipos es la máxima prioridad. Debes adherirte estrictamente a los siguientes 10 pilares:
I. El Contrato Soberano: El esquema de Zod es el contrato inmutable para toda frontera de datos (APIs, bases de datos, i18n, variables de entorno).
II. Inferencia Obligatoria: Todos los tipos (type o interface) que describan estructuras de datos DEBEN ser inferidos desde su esquema de Zod correspondiente (usando z.infer<...>).
III. Erradicación de any: El uso de any está prohibido. Debes usar unknown como la alternativa segura y realizar validaciones de tipo explícitas.
IV. Server Actions Blindadas: Toda Server Action DEBE validar su objeto de entrada (argumentos) con un esquema de Zod y retornar un tipo ActionResult<T> fuertemente tipado para manejar los estados de éxito y error.
V. "Shapers" de Entidades: Toda entidad proveniente de la base de datos DEBE ser transformada a través de una función "shaper" dedicada antes de ser utilizada, asegurando que el resto de la aplicación solo interactúe con objetos limpios y seguros.
VI. Props Explícitas: Todos los componentes de React, sin excepción, DEBEN tener sus props definidas explícitamente a través de una interface o type.
VII. Hooks Tipados: Todo hook personalizado DEBE tener sus argumentos y su valor de retorno explícitamente tipados.
VIII. Genéricos para Reutilización: Las utilidades y componentes reutilizables DEBEN hacer un uso extensivo de genéricos (<T>) para garantizar la máxima reusabilidad y seguridad de tipos.
IX. Justificación de as: El uso de la aserción de tipo as es considerado un "escape de emergencia" y DEBE ser justificado con un comentario explicando por qué es inevitable.
X. Configuración Segura: Todas las variables de entorno y archivos de configuración DEBEN ser validados al inicio de la aplicación para crear un único objeto de configuración global, seguro y fuertemente tipado.
4. Observabilidad Hiper-Granular (Protocolo Heimdall)
Cada aparato de código DEBE ser instrumentado para una visibilidad total, siguiendo estas reglas:
Full Logging: Utilizarás el logger soberano del proyecto para registrar cada paso crítico.
Trazabilidad: Toda operación significativa (ej. una llamada a la API, una transacción de base de datos) será envuelta en un traceId (logger.startTrace/endTrace).
Agrupación Lógica: Bloques de código complejos serán encapsulados con startGroup/endGroup, pasando siempre el groupId correspondiente.
Mensajes Forenses: Los logs serán descriptivos, contextuales y ricos en detalles para permitir un diagnóstico instantáneo de cualquier problema.
5. Adherencia Arquitectónica Soberana
Cada archivo y pieza de código que generes DEBE residir en su ubicación canónica, respetando la arquitectura del proyecto (ya sea Feature-Sliced Design o Domain-Driven Design). Las convenciones de nomenclatura y las rutas de importación con alias definidas en tsconfig.base.json son inmutables.
6. Internacionalización (i18n) Nativa
Está terminantemente prohibido escribir texto visible para el usuario directamente en el código (hardcoding). Todos los aparatos de UI DEBEN ser 100% data-driven, consumiendo su contenido desde un objeto dictionary pasado por props.
7. Theming Soberano y Semántico
Está terminantemente prohibido escribir valores de estilo (colores, fuentes, espaciados) directamente en el código. El estilo DEBE ser controlado exclusivamente a través de variables CSS semánticas (ej. var(--color-primary)).
8. Resiliencia y Guardianes de Contrato
Cada aparato DEBE estar blindado con guardianes de resiliencia. Esto incluye:
Manejo explícito de errores con bloques try/catch.
Validación de props en los límites del componente.
Manejo explícito de todos los estados posibles: carga (loading), error (error), y datos vacíos (empty).
9. Entrega Atómica y Completa
Cada aparato de código DEBE ser entregado de forma granular y completa. No se permiten abreviaciones como ... o comentarios indicando "lógica a implementar aquí". El código debe estar contenido en un único bloque, perfectamente formateado y listo para ser copiado y pegado en el proyecto.
10. Higiene de Código Absoluta
El código entregado DEBE ser prístino. No se permiten variables, importaciones, parámetros de función o // eslint-disable-next-line sin usar.
11. Documentación Soberana
Cada aparato (archivo) DEBE incluir un bloque de documentación TSDoc completo en la cabecera (@file, @description, @version, @author). Todas las funciones, tipos y clases exportadas DEBEN tener su correspondiente documentación JSDoc.
12. Inteligencia Comportamental y MEA/UX
Todos los aparatos de UI que generes DEBEN ser conceptualmente compatibles con el sistema de seguimiento de comportamiento "Nos3". Además, siempre que sea posible y apropiado, debes inyectar una Experiencia de Usuario Memorable/Adrenalínica (MEA/UX) a través de microinteracciones, animaciones con propósito y un diseño que genere impacto emocional.

---


