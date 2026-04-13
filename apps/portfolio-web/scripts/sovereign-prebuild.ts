/**
 * @file apps/portfolio-web/scripts/sovereign-prebuild.ts
 * @description Sovereign Infrastructure Orchestrator (MACS & Schema Engine).
 *              Refactorizado: Protección contra Build-Deadlock en Vercel.
 *              La síntesis de tipos ahora es un proceso de desarrollo local/CI explícito,
 *              bloqueado en Vercel para evitar fallos de ejecución en entorno estático.
 * @version 18.0 - Vercel Build Immune
 * @author Staff Engineer - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, parse, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { execSync } from 'node:child_process';

/** IMPORTACIONES DE CONTRATO (SSoT) */
import { dictionarySchema } from '../src/lib/schemas/dictionary.schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '../../..');
const APP_DIR = resolve(__dirname, '..');

// --- PROTOCOLO CROMÁTICO HEIMDALL v3.6 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', 
  bold: '\x1b[1m', dim: '\x1b[2m'
};

/**
 * @function synthesizePayloadTypes
 * @description Fase 1: Generación imperativa del contrato de tipos TS.
 * @pilar VII: Resiliencia - Implementa Fail-Fast y Guardia de Entorno Vercel.
 */
async function synthesizePayloadTypes(): Promise<void> {
  const start = performance.now();
  
  // Guardián de aislamiento: Vercel build es estático, no debe ejecutar CLI de Payload
  if (process.env.VERCEL === '1') {
    console.log(`${C.magenta}${C.bold}[DNA][SCHEMA]${C.reset} Entorno Vercel detectado. Saltando síntesis de tipos.`);
    return;
  }

  console.log(`${C.magenta}${C.bold}[DNA][SCHEMA]${C.reset} Iniciando síntesis de tipos de Payload...`);
  
  try {
    const configPath = 'packages/cms/core/src/payload.generate.config.ts';
    
    execSync('pnpm payload generate:types', {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      timeout: 180000, 
      env: {
        ...process.env,
        PAYLOAD_CONFIG_PATH: configPath,
        PAYLOAD_GENERATE: 'true',
        NODE_ENV: 'production'
      }
    });

    const typesPath = resolve(ROOT_DIR, 'packages/cms/core/src/payload-types.ts');
    await access(typesPath);

    const duration = (performance.now() - start).toFixed(2);
    console.log(`${C.green}   ✓ [OK] Contrato de tipos sellado | Latencia: ${duration}ms${C.reset}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Schema Drift';
    console.error(`\n${C.red}${C.bold}✖ [CRITICAL] FALLO EN SÍNTESIS DE TIPOS:${C.reset}`);
    console.error(`   ${C.red}↳ Motivo: ${msg}${C.reset}`);
    console.error(`   ${C.red}↳ El build no puede continuar sin el contrato de datos.${C.reset}\n`);
    process.exit(1); 
  }
}

/**
 * @function buildDictionaries
 * @description Fase 2: Ensamblaje de la narrativa (MACS Engine).
 */
async function buildDictionaries(): Promise<void> {
  const start = performance.now();
  console.log(`\n${C.magenta}${C.bold}[DNA][MACS]${C.reset} Iniciando síntesis de diccionarios...`);

  const msgDir = resolve(APP_DIR, 'src/messages');
  const dictDir = resolve(APP_DIR, 'src/dictionaries');
  
  try {
    await mkdir(dictDir, { recursive: true });
    const locales = (await readdir(msgDir)).filter(d => !d.startsWith('.'));
    console.log(`   ${C.dim}→ Perímetros detectados: ${locales.join(', ')}${C.reset}`);

    await Promise.all(locales.map(async (locale) => {
      const localePath = join(msgDir, locale);
      const accumulator: Record<string, unknown> = {};
      const files = (await readdir(localePath)).filter(f => f.endsWith('.json'));

      const fileContents = await Promise.all(
        files.map(async (file) => {
          const content = await readFile(join(localePath, file), 'utf-8');
          return { name: parse(file).name, data: JSON.parse(content) };
        })
      );

      fileContents.forEach(({ name, data }) => { accumulator[name] = data; });

      const validation = dictionarySchema.safeParse(accumulator);
      if (!validation.success) {
        console.error(`\n${C.red}${C.bold}✖ ERROR DE CONTRATO EN [${locale}]:${C.reset}`);
        validation.error.issues.forEach(issue => {
          console.error(`${C.red}  ↳ Path: ${C.yellow}${issue.path.join('.')}${C.reset} | ${issue.message}`);
        });
        throw new Error(`MACS_VALIDATION_FAILED: ${locale}`);
      }

      await writeFile(join(dictDir, `${locale}.json`), JSON.stringify(accumulator, null, 2));
      console.log(`   ${C.cyan}→ Nodo ${locale} [${Object.keys(accumulator).length} features] persistido.${C.reset}`);
    }));

    const duration = (performance.now() - start).toFixed(2);
    console.log(`${C.green}   ✓ [OK] MACS completada | Latencia: ${duration}ms${C.reset}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Content Drift';
    console.error(`\n${C.red}${C.bold}✖ [CRITICAL] FALLO EN SÍNTESIS DE CONTENIDO:${C.reset}`);
    console.error(`   ${C.red}↳ Motivo: ${msg}${C.reset}\n`);
    process.exit(1);
  }
}

/**
 * MOTOR SUPREMO
 */
async function runSovereignPrebuild() {
  const engineStart = performance.now();
  
  console.log(`\n${C.cyan}${C.bold}====================================================${C.reset}`);
  console.log(`${C.cyan}${C.bold}       SOVEREIGN PREBUILD ENGINE v18.0              ${C.reset}`);
  console.log(`${C.cyan}${C.bold}====================================================${C.reset}`);

  await synthesizePayloadTypes();
  await buildDictionaries();

  const total = (performance.now() - engineStart).toFixed(2);
  console.log(`\n${C.green}${C.bold}✨ INFRAESTRUCTRURA SELLADA Y LISTA PARA BUILD${C.reset}`);
  console.log(`${C.green}   Total Pipeline Time: ${C.yellow}${total}ms${C.reset}\n`);
}

runSovereignPrebuild();