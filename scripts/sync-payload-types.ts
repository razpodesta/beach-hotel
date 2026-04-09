/**
 * @file scripts/sync-payload-types.ts
 * @description Orquestador de Sincronización de Tipos (Local Provisioning Engine).
 *              Refactorizado: Implementación de Optional Catch Binding para erradicar 
 *              advertencias de variables no usadas (Pilar X).
 *              Propósito: Materializar localmente el contrato de tipos para su versionado.
 *              Uso: SOLO ejecución manual local. Prohibido en CI/CD.
 * @version 1.2 - Linter Pure & Zero Warnings Standard
 * @author Staff Engineer - MetaShark Tech
 */

import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';

// 1. PROTOCOLO CROMÁTICO HEIMDALL
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  bold: '\x1b[1m'
};

/**
 * 2. GUARDIA DE PERÍMETRO (Pilar VIII: Resiliencia)
 * @description Aborta inmediatamente si se detecta un entorno de construcción automatizada.
 *              Esto previene el deadlock circular en el pipeline de Vercel.
 */
if (process.env.VERCEL === '1' || process.env.CI === 'true') {
  console.warn(`${C.yellow}![DNA][SKIP] Execution denied in CI/Build environment to prevent deadlock.${C.reset}`);
  process.exit(0);
}

// 3. CARGA DE ENTORNO SOBERANO
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

/**
 * 4. CONFIGURACIÓN DE AISLAMIENTO (Isolated Synthesis Mode)
 */
const CONFIG_PATH = 'packages/cms/core/src/payload.config.ts';
process.env.PAYLOAD_CONFIG_PATH = CONFIG_PATH;
process.env.PAYLOAD_GENERATE = 'true';

/**
 * @function syncTypes
 * @description Ejecuta el binario de Payload para sincronizar los contratos de tipos.
 */
async function syncTypes() {
  const startTime = performance.now();
  const traceId = `type_sync_${Date.now().toString(36).toUpperCase()}`;

  console.log(`\n${C.magenta}${C.bold}[DNA][PROVISIONER]${C.reset} Iniciando síntesis de tipos | Trace: ${C.cyan}${traceId}${C.reset}`);
  
  try {
    console.log(`   ${C.yellow}→ [INFRA]${C.reset} Evaluando configuración: ${CONFIG_PATH}`);
    
    /**
     * @step Ejecución del Generador.
     * Genera el archivo físico que el Core CMS exportará como SSoT.
     */
    execSync('pnpm payload generate:types', {
      stdio: 'inherit',
      env: {
        ...process.env,
        PAYLOAD_CONFIG_PATH: CONFIG_PATH
      }
    });

    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`\n${C.green}${C.bold}[SUCCESS]${C.reset} Contrato de tipos materializado localmente en ${C.yellow}${duration}ms${C.reset}`);
    console.log(`${C.cyan}[INFO]${C.reset} Asegúrese de incluir 'packages/cms/core/src/payload-types.ts' en su próximo commit.\n`);

  } catch {
    /** 
     * @fix: Omitimos el argumento del catch (Optional Catch Binding).
     * Esto satisface la regla @typescript-eslint/no-unused-vars al 100%.
     */
    console.error(`\n${C.red}${C.bold}[DNA][ERROR]${C.reset} Fallo en el aprovisionamiento de tipos. Verifique su base de datos local.`);
    process.exit(1);
  }
}

// Ejecución del Nodo
syncTypes().catch(() => process.exit(1));