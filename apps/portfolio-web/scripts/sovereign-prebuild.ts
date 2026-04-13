/**
 * @file apps/portfolio-web/scripts/sovereign-prebuild.ts
 * @description Enterprise Infrastructure Orchestrator (MACS v21.0).
 *              Implementa el "Isolated Synthesis Mode" y el "Workspace Discovery Engine".
 *              Refactorizado: Cumplimiento estricto de reglas de logging (Pilar IV).
 *              Optimizado: Jerarquía de logs forenses mediante grupos de consola.
 * 
 * @version 21.0 - Lint Pure & Structural Logging Injected
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

/** 
 * REGISTRO DE NODOS LEGO (Workspace Inventory)
 * Estos nodos serán escaneados en busca de narrativa propia (/src/lib/i18n).
 */
const SOVEREIGN_NODES = [
  'communication-dispatch-hub',
  'revenue-engine',
  'partner-management-system',
  'data-ingestion-service',
  'hospitality-business-logic',
  'customer-relationship-logic',
  'shared-design-system',
  'webgl-rendering-engine',
  'seo-metadata-orchestrator',
  'internationalization-registry',
  'storage-adapter-layer',
  'telemetry-observability-service'
];

// --- PROTOCOLO CROMÁTICO HEIMDALL v4.0 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', 
  bold: '\x1b[1m', dim: '\x1b[2m'
};

/**
 * @function synthesizePayloadTypes
 * @description Fase 1: Síntesis de contratos TS en modo aislado.
 */
async function synthesizePayloadTypes(): Promise<void> {
  const start = performance.now();
  
  if (process.env.VERCEL === '1' || process.env.SKIP_TYPEGEN === 'true') {
    console.info(`${C.magenta}${C.bold}[DNA][SCHEMA]${C.reset} Entorno estático detectado. Usando contrato persistido.`);
    return;
  }

  console.info(`${C.magenta}${C.bold}[DNA][SCHEMA]${C.reset} Iniciando síntesis de tipos (Isolated Mode)...`);
  
  try {
    const configPath = 'packages/cms/core/src/payload.generate.config.ts';
    
    execSync('pnpm payload generate:types', {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      timeout: 120000, 
      env: {
        ...process.env,
        PAYLOAD_CONFIG_PATH: configPath,
        PAYLOAD_GENERATE: 'true',
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://ghost:ghost@localhost:5432/ghost'
      }
    });

    const typesPath = resolve(ROOT_DIR, 'packages/cms/core/src/payload-types.ts');
    await access(typesPath);

    const duration = (performance.now() - start).toFixed(2);
    console.info(`${C.green}   ✓ [OK] Contrato de datos sellado | Latencia: ${duration}ms${C.reset}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Schema Collision';
    console.error(`\n${C.red}${C.bold}✖ [CRITICAL] FALLO EN SÍNTESIS DE TIPOS:${C.reset}`);
    console.error(`   ${C.red}↳ Motivo: ${msg}${C.reset}\n`);
    process.exit(1); 
  }
}

/**
 * @function buildDictionaries
 * @description Fase 2: Ensamblaje de narrativa (Workspace Discovery Engine).
 */
async function buildDictionaries(): Promise<void> {
  const start = performance.now();
  console.group(`${C.magenta}${C.bold}[DNA][MACS]${C.reset} Iniciando descubrimiento de narrativa...`);

  const localMsgDir = resolve(APP_DIR, 'src/messages');
  const dictDir = resolve(APP_DIR, 'src/dictionaries');
  
  try {
    await mkdir(dictDir, { recursive: true });
    const locales = (await readdir(localMsgDir)).filter(d => !d.startsWith('.'));
    console.info(`   ${C.dim}→ Perímetros activos: ${locales.join(', ')}${C.reset}`);

    await Promise.all(locales.map(async (locale) => {
      console.group(`${C.cyan}→ Procesando Perímetro: [${locale}]${C.reset}`);
      const accumulator: Record<string, unknown> = {};

      // 1. Descubrimiento en App Local (portfolio-web)
      const localPath = join(localMsgDir, locale);
      const localFiles = (await readdir(localPath)).filter(f => f.endsWith('.json'));
      
      for (const file of localFiles) {
        const content = await readFile(join(localPath, file), 'utf-8');
        accumulator[parse(file).name] = JSON.parse(content);
      }

      // 2. Descubrimiento en Workspaces (@metashark/*)
      for (const node of SOVEREIGN_NODES) {
        const nodeI18nPath = resolve(ROOT_DIR, `packages/${node}/src/lib/i18n/${locale}.json`);
        try {
          await access(nodeI18nPath);
          const nodeContent = await readFile(nodeI18nPath, 'utf-8');
          // El nombre del nodo se convierte en la llave del diccionario (ej: comms_hub)
          const key = node.replace(/-/g, '_');
          accumulator[key] = JSON.parse(nodeContent);
          console.info(`      ${C.green}↳ Nodo [${node}] inyectado.${C.reset}`);
        } catch {
          // El nodo no tiene i18n para este locale o no ha sido migrado aún.
        }
      }

      // 3. Validación de Contrato Global (SSoT)
      const validation = dictionarySchema.safeParse(accumulator);
      if (!validation.success) {
        console.error(`\n${C.red}${C.bold}✖ ERROR DE CONTRATO EN [${locale}]:${C.reset}`);
        validation.error.issues.forEach(issue => {
          console.error(`${C.red}  ↳ Path: ${C.yellow}${issue.path.join('.')}${C.reset} | ${issue.message}`);
        });
        throw new Error(`MACS_VALIDATION_FAILED: ${locale}`);
      }

      await writeFile(join(dictDir, `${locale}.json`), JSON.stringify(accumulator, null, 2));
      console.groupEnd();
    }));

    const duration = (performance.now() - start).toFixed(2);
    console.groupEnd();
    console.info(`${C.green}   ✓ [OK] MACS Discovery completada | Latencia: ${duration}ms${C.reset}`);
  } catch (err: unknown) {
    console.groupEnd();
    const msg = err instanceof Error ? err.message : 'Content Drift';
    console.error(`\n${C.red}${C.bold}✖ [CRITICAL] FALLO EN SÍNTESIS DE CONTENIDO:${C.reset}`);
    console.error(`   ${C.red}↳ Motivo: ${msg}${C.reset}\n`);
    process.exit(1);
  }
}

/**
 * MOTOR SUPREMO: runSovereignPrebuild
 */
async function runSovereignPrebuild() {
  const engineStart = performance.now();
  
  console.info(`\n${C.cyan}${C.bold}====================================================${C.reset}`);
  console.info(`${C.cyan}${C.bold}       SOVEREIGN PREBUILD ENGINE v21.0              ${C.reset}`);
  console.info(`${C.cyan}${C.bold}====================================================${C.reset}`);

  await synthesizePayloadTypes();
  await buildDictionaries();

  const total = (performance.now() - engineStart).toFixed(2);
  console.info(`\n${C.green}${C.bold}✨ INFRAESTRUCTRURA SELLADA Y LISTA PARA BUILD${C.reset}`);
  console.info(`${C.green}   Total Pipeline Time: ${C.yellow}${total}ms${C.reset}\n`);
}

runSovereignPrebuild();