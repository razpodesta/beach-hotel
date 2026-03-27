Manifiesto de Arquitectura: "Pure Source-First & Cloud-Agnostic Libraries"
Versión: 4.0 (Infraestructura de Transición: Vercel a AWS/Alibaba)
Estatus: OBLIGATORIO Y SSoT (Single Source of Truth)
Autor: Raz Podestá - MetaShark Tech
1. Misión y Filosofía Arquitectónica
Este manifiesto erradica la fricción entre el desarrollo local y el despliegue multi-nube. Abandonamos el enfoque "Build-First" (generar artefactos físicos en dist/ para cada librería) en favor de una arquitectura "Pure Source-First".
Nuestras librerías (@metashark/cms-core, @metashark/auth-shield, etc.) ya no se compilan de forma aislada. Son tratadas como extensiones lógicas de la aplicación consumidora. La inteligencia de compilación se delega exclusivamente a los orquestadores finales (Next.js SWC, tsx, @swc/jest).
2. La Estrategia Cloud-Agnostic (Vercel ➔ AWS/Alibaba)
Actualmente operamos en Vercel (Edge/Serverless), pero nuestro destino es una infraestructura soberana en AWS o Alibaba Cloud basada en contenedores (Docker).
¿Por qué el "Pure Source-First" es la única vía para lograr esto?
Para migrar a AWS, Next.js utilizará la configuración output: 'standalone'. En este modo, el compilador rastrea el árbol de dependencias y copia únicamente los archivos necesarios a una carpeta aislada (.next/standalone), lista para ser dockerizada.
Si nuestras librerías requieren un paso de compilación previo (tsc a dist/), el rastreador de Next.js se rompe o incluye artefactos innecesarios. Al consumir todo directamente desde src/, Next.js agrupa el monorepo entero en un único microservicio altamente optimizado, agnóstico a la nube.
3. Los 4 Pilares de la Librería Pura
I. Erradicación del Build Físico (Zero-Build Packages)
Queda estrictamente prohibido el uso del ejecutor @nx/js:tsc para generar carpetas dist/ en los paquetes internos. Las librerías son repositorios de conocimiento tipado, no artefactos pre-compilados.
Acción: Eliminar el target build de todos los project.json en packages/.
Beneficio: Reducción del 40% del tiempo de CI/CD. Cero riesgos de que el código ejecutado esté desfasado con los tipos.
II. Resolución de Módulos Centralizada (tsconfig.base.json)
El ecosistema no utilizará la resolución estándar de Node.js (buscar en node_modules o leer el package.json de la librería). Toda resolución de rutas será dictada por la constitución del monorepo (tsconfig.base.json).
code
JSON
"paths": {
  "@metashark/auth-shield":["packages/auth-shield/src/index.ts"],
  "@metashark/protocol-33":["packages/protocol-33/src/index.ts"]
}
III. Contratos de Paquete Limpios (Higiene de package.json)
Dado que Node.js y Next.js resolverán las librerías a través del tsconfig.base.json, el package.json de cada librería se reduce a su mínima expresión estructural.
Prohibido: Usar "main": "./src/index.ts" o configuraciones "exports" complejas que engañen a Node.
Obligatorio:
code
JSON
{
  "name": "@metashark/auth-shield",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "dependencies": {
    "bcryptjs": "^3.0.3"
  }
}
(Nota: sideEffects: false es innegociable. Permite a Next.js y SWC realizar Tree-Shaking agresivo al empaquetar para AWS).
IV. Delegación de Transpilación (The Consumers)
Cada consumidor es soberano y responsable de transpilar el TypeScript que importa desde packages/:
Next.js (Web App): Utiliza transpilePackages: ['@metashark/auth-shield', ...] en el next.config.ts.
Scripts de Infraestructura: Utilizan tsx (ej. tsx scripts/supabase/seed-database.ts), el cual compila al vuelo.
Espejo de Calidad (Jest): Utiliza @swc/jest configurado en jest.preset.js para procesar el código de la librería durante el test.
4. Reglas de Código Obligatorias (Strict ESM)
Para garantizar que el código fuente de nuestras librerías (src/) sea compatible con entornos nativos de Node.js (crítico para scripts del CMS y migraciones futuras a contenedores Docker), se debe mantener el rigor del estándar ECMAScript Modules (ESM).
Configuración: En el tsconfig.json de cada librería se mantiene "module": "nodenext", "moduleResolution": "nodenext" y "noEmit": true.
Sintaxis: TODA importación relativa interna dentro de un paquete DEBE incluir la extensión .js (aunque el archivo físico sea .ts).
Ejemplo Canónico en @metashark/auth-shield/src/index.ts:
code
TypeScript
// ❌ PROHIBIDO (Falla en Node.js nativo / Docker)
export * from './lib/token';

// ✅ OBLIGATORIO (ESM Estricto y Resiliente)
export * from './lib/token.js';
Veredicto Arquitectónico Final
Esta arquitectura "Pure Source-First" elimina la esquizofrenia de mantener dos fuentes de verdad (el src/ que usaba el IDE y el dist/ roto que generaba Nx).
Al abrazar este modelo, el monorepo se convierte en un bloque monolítico de TypeScript durante el desarrollo (máxima DX y HMR), pero se compila en un artefacto standalone de Node.js (Docker Ready) perfectamente optimizado y agnóstico a la nube en el momento del despliegue, facilitando nuestra transición de Vercel a la soberanía total en AWS/Alibaba.

---

