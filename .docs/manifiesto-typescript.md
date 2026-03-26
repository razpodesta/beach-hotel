Manifiesto TypeScript: Arquitectura "Dual-Mode Resolution" v6.0
Versión: 6.0 (Staff Engineer Standard - Production Ready)
Estatus: OBLIGATORIO Y SSoT (Single Source of Truth)
Autor: Raz Podestá - MetaShark Tech
1. Filosofía Arquitectónica: La Dualidad Eficiente
Este ecosistema rechaza el compromiso entre velocidad de desarrollo (DX) y estabilidad de infraestructura. Implementamos una arquitectura Dual-Mode que resuelve la fricción entre empaquetadores modernos (Next.js) y entornos de ejecución estrictos (Node.js/CI).
Principio de Inmediatez: Los empaquetadores consumen código fuente (src/) para Hot-Module Replacement instantáneo.
Principio de Realidad: La infraestructura consume artefactos físicos (dist/) para garantizar consistencia y predictibilidad.
2. Los Dos Modos de Resolución
🔹 Modo 1: Source-First (DX / Next.js)
Este modo se activa exclusivamente dentro del pipeline de Next.js y el IDE.
Mecánica de Resolución: Se apoya en los paths de tsconfig.base.json con wildcards (/*) para mapear alias directamente a archivos .ts.
Compilación: Delegada a SWC mediante la directiva transpilePackages en next.config.js. Next.js ignora la carpeta dist/ de las librerías.
Objetivo: Latencia cero en el ciclo de feedback del desarrollador.
🔹 Modo 2: Build-First (Node.js / CI / Scripts)
Este modo se activa en ejecuciones de Node.js puro, herramientas de infraestructura y validación de tipos incremental.
Mecánica de Resolución: Node.js respeta los contratos definidos en el package.json de cada librería.
Compilación: Ejecutada por Nx (@nx/js:tsc). Produce archivos .js reales y metadatos de tipos .d.ts en una carpeta dist/ local a cada paquete.
Objetivo: Estabilidad total. Evita el "JS Fantasma" y garantiza que los tipos sean inmutables entre fronteras.
3. Pilares Innegociables de Configuración
I. Consistencia de Emisión (No más JS Fantasmas)
Regla: Toda librería con un punto de entrada en package.json DEBE emitir código JavaScript real.
Configuración: En tsconfig.lib.json, "emitDeclarationOnly": false es obligatorio. El contrato (main, module, exports) debe tener un respaldo físico en dist/.
II. Encapsulamiento de Distribución (Self-Contained Dist)
Regla: Las rutas en package.json no pueden salir del directorio del paquete. Está prohibido el uso de ../ en el bloque exports.
Estructura: Cada librería gestiona su propia carpeta dist/ local.
Tree-Shaking: Es obligatorio incluir "sideEffects": false para permitir la eliminación de código muerto en el empaquetado final de Next.js.
III. Resolución Híbrida de Tipos
IDE (tsconfig.json): Usa "moduleResolution": "bundler" para alinearse con Next.js y permitir importaciones modernas sin extensiones.
Build (tsconfig.lib.json): Usa "moduleResolution": "nodenext" para forzar el rigor de ESM y garantizar que el código emitido sea un ciudadano ejemplar del ecosistema Node.js.
IV. Gobernanza del Grafo (Composite & References)
Regla: "composite": true es obligatorio en librerías. El tsconfig.json raíz debe orquestar todas las references en orden topológico (dependencias base primero).
Higiene: Está prohibida la existencia de archivos .d.ts manuales en la carpeta src/. TypeScript es el dueño soberano de las declaraciones; mantener versiones manuales es una regresión arquitectónica.
4. Estrategia de Testing (El Espejo de Calidad)
Para evitar que las pruebas se conviertan en un silo de configuración diferente al desarrollo:
Transformación: Jest utiliza @swc/jest para operar en modo Source-First sobre la carpeta src/.
Paridad: El moduleNameMapper en jest.preset.js debe sincronizarse dinámicamente con los alias de la raíz, asegurando que Jest "ve" el monorepo exactamente igual que Next.js.
5. Pipeline de Integración y Caché (Nx Engine)
Para maximizar la eficiencia en CI/CD, el archivo nx.json debe seguir estas reglas:
sharedGlobals: Cambios en package.json (raíz), pnpm-lock.yaml y tsconfig.base.json invalidan el caché global.
Invalidación por Configuración: Los archivos tsconfig.lib.json y next.config.js locales son inputs críticos de producción.
Dependencias de Tarea: El target typecheck depende de ^typecheck, asegurando que ninguna aplicación sea validada si sus dependencias de primer nivel tienen errores de contrato.
6. Protocolo de Creación de Nuevos Aparatos
Al añadir una nueva librería al ecosistema:
Registrar Alias: Añadir rumbos con wildcards en tsconfig.base.json.
Configurar Dual-Mode: Crear tsconfig.json (IDE/bundler) y tsconfig.lib.json (Build/nodenext).
Definir Contrato: Configurar package.json con type: module, exports hacia dist/, y sideEffects: false.
Actualizar Grafo: Añadir la ruta a las references del tsconfig.json raíz y de la aplicación web.
Purga Inicial: Asegurar que no existan .d.ts manuales antes del primer build.
7. Señales de Alerta (Reevaluación)
Esta arquitectura debe ser auditada si:
Type Drift: Se detectan inconsistencias entre lo que el IDE muestra y lo que el build de producción emite.
Build Fatigue: Los tiempos de build en Vercel escalan de forma no lineal (indicador de exceso de transpilación al vuelo).
Module Collisions: Errores de "Duplicate Identifier" causados por declaraciones residuales en src/.

---

