/**
 * @file scripts/generate-payload-artifacts.ts
 * @description Orquestador de Infraestructura para la Síntesis de Artefactos Payload.
 *              Implementa el Protocolo Heimdall v2.0 con Watchdog activo,
 *              medición de latencia de micro-fase y blindaje de tipos absoluto.
 *              Refactorizado: Resolución de TS 'no-explicit-any', estrechamiento de
 *              tipos para errores de subproceso y trazabilidad forense.
 * @version 5.0 - Forensic Watchdog Standard (Linter Pure)
 * @author Staff Engineer - MetaShark Tech
 */

import { execSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

/**
 * CONTRATOS DE SEGURIDAD E INFRAESTRUCTRURA
 */
const WATCHDOG_TIMEOUT_MS = 45000; // 45s para compensar el "Cold Start" de Node en CI/CD
const BIN = './node_modules/.bin/payload';

/**
 * @interface ProcessError
 * @description Contrato para capturar anomalías de ejecución de subprocesos.
 */
interface ProcessError extends Error {
  code?: string;
  status?: number;
}

/**
 * @description Entorno de ejecución soberano. 
 * Garantiza que Payload opere en modo 'Generation Only'.
 */
const env: NodeJS.ProcessEnv = { 
  ...process.env, 
  PAYLOAD_GENERATE: 'true',
  NODE_ENV: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'production' | 'development',
  DEBUG: 'payload:*'
};

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', 
  bold: '\x1b[1m', gray: '\x1b[90m'
};

/**
 * MODULE: runCommandWithWatchdog
 * @description Ejecuta un comando de sistema con telemetría DNA y guardia de tiempo.
 * @param {string} command - El comando de Payload a ejecutar.
 * @param {string} label - Identificador descriptivo para el log de Heimdall.
 */
function runCommandWithWatchdog(command: string, label: string): void {
  const phaseId = `phase_${Math.random().toString(36).substring(7)}`;
  const startTime = performance.now();
  
  console.log(`\n${C.magenta}${C.bold}[DNA][PIPELINE]${C.reset} ${C.cyan}INICIANDO: ${label}${C.reset} | ID: ${phaseId}`);
  console.log(`${C.gray}  → Executing: ${BIN} ${command}${C.reset}`);

  try {
    /**
     * @pilar VIII: Resiliencia. 
     * El timeout de execSync actúa como nuestro primer nivel de Watchdog.
     */
    execSync(`${BIN} ${command}`, { 
      stdio: 'inherit', 
      env,
      timeout: WATCHDOG_TIMEOUT_MS 
    });
    
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`${C.green}   ✓ [OK]${C.reset} ${label} sincronizado en ${C.yellow}${duration}s${C.reset}`);

  } catch (error: unknown) {
    /**
     * @pilar III: Seguridad de Tipos.
     * Estrechamiento forense del error unknown para evitar el uso de 'any'.
     */
    const e = error as ProcessError;
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);

    console.group(`\n${C.red}${C.bold}💥 [HEIMDALL][CRITICAL_ANOMALY]${C.reset}`);
    console.error(`Aparato: ${label}`);
    console.error(`Trace_ID: ${phaseId}`);
    console.error(`Latencia Fallida: ${duration}s`);

    if (e.code === 'ETIMEDOUT') {
      console.error(`${C.yellow}CAUSA: Watchdog Timeout Excedido (${WATCHDOG_TIMEOUT_MS}ms).${C.reset}`);
      console.error('DIAGNÓSTICO: El motor de Payload se ha quedado bloqueado. Verifique importaciones circulares.');
    } else {
      console.error(`DETALLE: ${e.message || 'Error de sistema no identificado'}`);
    }
    console.groupEnd();

    process.exit(1);
  }
}

// ============================================================================
// PROTOCOLO DE EJECUCIÓN SOBERANA
// ============================================================================

const totalStart = performance.now();
console.log(`\n${C.cyan}${C.bold}🛡️ [HEIMDALL] INICIANDO HANDSHAKE DE ARTEFACTOS SOBERANOS${C.reset}`);
console.log(`${C.gray}------------------------------------------------------------${C.reset}`);

/**
 * FASE 1: SÍNTESIS DE TIPOS (SSoT)
 * Garantiza que la App Web tenga contratos de datos inmutables.
 */
runCommandWithWatchdog(
  'generate:types --config packages/cms/core/src/payload.generate.config.ts', 
  'SÍNTESIS DE CONTRATOS (payload-types.ts)'
);

/**
 * FASE 2: ORQUESTACIÓN DE VISTAS
 * Genera el importMap crítico para el funcionamiento de Payload 3.0.
 */
runCommandWithWatchdog(
  'generate:importmap --config packages/cms/core/src/payload.config.ts', 
  'MAPEO DE INFRAESTRUCTRURA (importMap.js)'
);

const totalDuration = ((performance.now() - totalStart) / 1000).toFixed(2);
console.log(`${C.gray}------------------------------------------------------------${C.reset}`);
console.log(`${C.green}${C.bold}✨ PIPELINE FINALIZADO EXITOSAMENTE EN ${totalDuration}s${C.reset}\n`);

process.exit(0);