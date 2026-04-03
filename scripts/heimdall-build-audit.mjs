/**
 * @file scripts/heimdall-build-audit.mjs
 * @description Orquestador de Construcción con Telemetría Forense (Protocolo Heimdall).
 *              Mapea el sistema de archivos de Vercel para resolver el "Build Fantasma".
 * @version 1.2 - Full Forensic Scan & ESLint Clean
 * @author Raz Podestá - MetaShark Tech
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', 
  red: '\x1b[31m', cyan: '\x1b[36m', yellow: '\x1b[33m', 
  magenta: '\x1b[35m', gray: '\x1b[90m'
};

const log = (msg, color = C.cyan) => console.log(`${color}${C.bold}[HEIMDALL] ${msg}${C.reset}`);

/**
 * Escáner recursivo profundo con métricas de tamaño
 * @fix: Eliminado parámetro 'e' no usado para cumplir con ESLint
 */
function deepScan(dir, depth = 0) {
  const indent = "  ".repeat(depth);
  if (depth > 5) return; // Límite de seguridad para no saturar el log
  
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        if (['node_modules', '.git', '.nx', 'cache', 'tmp'].includes(item)) continue;
        console.log(`${C.gray}${indent}📁 ${item}/${C.reset}`);
        deepScan(fullPath, depth + 1);
      } else {
        const size = (stats.size / 1024).toFixed(1);
        const color = item.endsWith('manifest.json') ? C.green : C.reset;
        console.log(`${indent}${color}📄 ${item}${C.reset} ${C.gray}(${size} KB)${C.reset}`);
      }
    }
  } catch {
    // Silencio operativo: fallos de permisos ignorados para mantener fluidez
  }
}

async function runAudit() {
  const startTime = Date.now();
  console.log(`\n${C.magenta}====================================================${C.reset}`);
  log("INICIANDO AUTOPSIA DE CONSTRUCCIÓN SOBERANA", C.magenta);
  console.log(`${C.magenta}====================================================${C.reset}\n`);

  try {
    // --- PHASE 1: TELEMETRÍA DE ENTRADA ---
    log("FASE 1: Auditoría de Contexto Operativo...");
    console.log(`   Punto de montaje (CWD): ${process.cwd()}`);
    console.log(`   Arquitectura Nodo: ${process.arch} | OS: ${process.platform}`);
    console.log(`   Variables: DATABASE_URL=${process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'}`);

    // --- PHASE 2: PURGA TOTAL ---
    log("FASE 2: Purga de Artefactos Fantasmas...");
    const targets = ['dist', '.next', 'apps/portfolio-web/.next', 'out'];
    targets.forEach(t => {
      if (fs.existsSync(t)) {
        log(`   Eradicando residuo: ${t}`, C.yellow);
        fs.rmSync(t, { recursive: true, force: true });
      }
    });

    // --- PHASE 3: MACS ENGINE ---
    log("FASE 3: Sincronización de Diccionarios (MACS)...");
    execSync('pnpm run prebuild:web', { stdio: 'inherit' });

    // --- PHASE 4: THE BIG BUILD ---
    log("FASE 4: Ejecutando Nx Build (Protocolo de Alta Fidelidad)...");
    // Forzamos bypass de cache para que no nos de carpetas vacías del pasado
    execSync('nx build portfolio-web --configuration=production --skip-nx-cache', { stdio: 'inherit' });

    // --- PHASE 5: EL MAPA DE LA VERDAD ---
    log("FASE 5: Escaneo Forense Post-Build...", C.yellow);
    
    console.log(`\n${C.cyan}${C.bold}🔍 EXPLORACIÓN DE RAÍZ (./):${C.reset}`);
    deepScan('.');

    const nxTarget = 'dist/apps/portfolio-web';
    if (fs.existsSync(nxTarget)) {
      console.log(`\n${C.green}${C.bold}🔍 EXPLORACIÓN DE SALIDA NX (${nxTarget}):${C.reset}`);
      deepScan(nxTarget);
    }

    // --- PHASE 6: LOCALIZADOR DE MANIFIESTO ---
    log("FASE 6: Hunting 'routes-manifest.json'...");
    try {
      const finder = execSync('find . -name "routes-manifest.json" -not -path "*/node_modules/*"').toString().trim();
      if (finder) {
        log(`🎯 OBJETIVO LOCALIZADO EN: ${finder}`, C.green);
        const suggestedOutput = path.dirname(path.dirname(finder)); // Sube dos niveles desde el manifiesto
        log(`💡 ACCIÓN RECOMENDADA: Configura "Output Directory" en Vercel como: ${suggestedOutput.replace(/^\.\//, '')}`, C.magenta);
      } else {
        log("💀 ERROR CRÍTICO: El manifiesto no existe en el disco duro virtual.", C.red);
      }
    } catch {
      log("✖ El comando 'find' falló en este entorno.", C.red);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`SECUENCIA COMPLETADA EN ${duration}s`, C.green);
    console.log(`\n${C.magenta}====================================================${C.reset}\n`);

  } catch (error) {
    log(`ANOMALÍA DETECTADA: ${error.message}`, C.red);
    process.exit(1);
  }
}

runAudit();