/**
 * @file scripts/heimdall-build-audit.mjs
 * @description Orquestador de Construcción con Telemetría Forense (Protocolo Heimdall).
 *              Mapea el sistema de archivos de Vercel para localizar el cerebro de Next.js.
 * @version 1.1 - Deep Forensic Discovery
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
 * Función recursiva para mapear el ADN del build
 */
function mapDirectory(dir, depth = 0) {
  const indent = "  ".repeat(depth);
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        console.log(`${C.gray}${indent}📁 ${item}/${C.reset}`);
        // No entramos en node_modules para evitar ruido masivo
        if (item !== 'node_modules' && item !== 'cache') {
          mapDirectory(fullPath, depth + 1);
        }
      } else {
        const size = (stats.size / 1024).toFixed(1);
        const isManifest = item === 'routes-manifest.json' ? C.green : '';
        console.log(`${indent}${isManifest}📄 ${item}${C.reset} ${C.gray}(${size} KB)${C.reset}`);
      }
    }
  } catch (e) {
    console.log(`${C.red}${indent}✖ Error leyendo: ${dir}${C.reset}`);
  }
}

async function runAudit() {
  console.log(`\n${C.magenta}====================================================${C.reset}`);
  log("INICIANDO SECUENCIA DE CONSTRUCCIÓN SOBERANA", C.magenta);
  console.log(`${C.magenta}====================================================${C.reset}\n`);

  try {
    // PHASE 1: Entorno de Vercel
    log("FASE 1: Auditoría de Entorno...");
    console.log(`   CWD: ${process.cwd()}`);
    console.log(`   Vercel Node: ${process.version}`);
    
    // Verificación de variables críticas
    const hasDB = process.env.DATABASE_URL ? '✓' : '✖';
    log(`Bóveda de Datos: [${hasDB}] DATABASE_URL`, hasDB === '✓' ? C.green : C.red);

    // PHASE 2: Purga de Residuos
    log("FASE 2: Purga Quirúrgica...");
    ['dist', '.next', 'apps/portfolio-web/.next'].forEach(folder => {
      if (fs.existsSync(folder)) {
        log(`   Eliminando residuo: ${folder}`, C.yellow);
        fs.rmSync(folder, { recursive: true, force: true });
      }
    });

    // PHASE 3: Prebuild MACS (Sincronía de Diccionarios)
    log("FASE 3: Ensamblando Diccionarios (MACS)...");
    execSync('pnpm run prebuild:web', { stdio: 'inherit' });

    // PHASE 4: Nx Build de Alta Prioridad
    log("FASE 4: Ejecutando Nx Build (Pure Source-First)...");
    // Desactivamos caché para garantizar que el reporte sea del build actual
    execSync('nx build portfolio-web --configuration=production --skip-nx-cache', { stdio: 'inherit' });

    // PHASE 5: Mapeo Forense (La clave del éxito)
    log("FASE 5: Escaneo Forense de Artefactos...", C.yellow);
    const targetDir = 'dist/apps/portfolio-web';
    
    if (fs.existsSync(targetDir)) {
      console.log(`\n${C.green}${C.bold}--- MAPA FÍSICO DE SALIDA ---${C.reset}`);
      mapDirectory(targetDir);
      console.log(`${C.green}${C.bold}------------------------------${C.reset}\n`);
    } else {
      log("ERROR CRÍTICO: El directorio de salida no fue creado por Nx.", C.red);
      log("Escaneando raíz para localizar restos del build...");
      execSync('find . -maxdepth 3 -name "dist" -o -name ".next"', { stdio: 'inherit' });
    }

    // PHASE 6: Verificación de Manifiesto (Punto de Falla Vercel)
    const manifestPath = path.join(targetDir, '.next', 'routes-manifest.json');
    if (fs.existsSync(manifestPath)) {
      log(`✅ ÉXITO: Manifiesto localizado en: ${manifestPath}`, C.green);
      log("Vercel debería reconocer el build ahora.", C.green);
    } else {
      log("❌ ALERTA: Manifiesto no encontrado en la ruta estándar.", C.red);
      log("Iniciando búsqueda profunda en el clúster...");
      try {
        const found = execSync('find dist -name "routes-manifest.json"').toString().trim();
        log(`Manifiesto localizado vía búsqueda profunda en: ${found}`, C.yellow);
        log(`IA SUGERENCIA: Cambiar outputDirectory en vercel.json a la carpeta padre de: ${path.dirname(found)}`, C.magenta);
      } catch {
        log("ERROR: El archivo routes-manifest.json no existe en ninguna parte de /dist.", C.red);
      }
    }

    log("SECUENCIA COMPLETADA EXITOSAMENTE", C.green);
    console.log(`\n${C.magenta}====================================================${C.reset}\n`);

  } catch (error) {
    log(`FALLO EN LA OPERACIÓN: ${error.message}`, C.red);
    process.exit(1);
  }
}

runAudit();