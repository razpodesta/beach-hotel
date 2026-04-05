/**
 * @file scripts/generate-payload-artifacts.ts
 * @version 2.1 - Type-Safe Pipeline Engine
 * @description Orquestador de generación de artefactos Payload 3.0.
 *              Refactorizado para resolver la colisión de tipos en NodeJS.ProcessEnv.
 * @author Staff Engineer - MetaShark Tech
 */

import { execSync } from 'node:child_process';

console.log('🛡️ [HEIMDALL][PIPELINE] Generación de Artefactos de Payload Iniciada...');

/**
 * @description Construcción del entorno soberano.
 * Forzamos el casting a NodeJS.ProcessEnv para satisfacer la estricta 
 * validación de tipos de Node en el monorepo.
 */
const env = { 
  ...process.env, 
  PAYLOAD_GENERATE: 'true',
  NODE_ENV: 'production' 
} as NodeJS.ProcessEnv;

try {
  // Generación de tipos estáticos
  console.log('   ○ [1/2] Generando tipos inmutables (payload-types.ts)...');
  execSync('payload generate:types', { 
    stdio: 'inherit', 
    env 
  });

  // Generación de mapa de rutas dinámicas
  console.log('   ○ [2/2] Generando mapa de importaciones (importMap.js)...');
  execSync('payload generate:importmap', { 
    stdio: 'inherit', 
    env 
  });

  console.log('✨ [HEIMDALL][PIPELINE] Artefactos generados exitosamente.');
  process.exit(0);
} catch (e) {
  console.error('💥 [HEIMDALL][PIPELINE] Error crítico durante la síntesis de artefactos:', e);
  process.exit(1);
}