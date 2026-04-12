/**
 * @file apps/portfolio-web/scripts/sovereign-prebuild.ts
 * @description Orquestador de Infraestructura Forense (MACS Sync Engine).
 *              Sincroniza, ensambla y valida los diccionarios internacionalizados
 *              garantizando la integridad del contrato SSoT antes del build.
 *              Refactorizado: Procesamiento paralelo, reporte de errores granular
 *              y telemetría Heimdall v2.5.
 * @version 15.0 - Parallel Synthesis & Forensic Auditing
 * @author Staff Engineer - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

/** IMPORTACIONES DE CONTRATO (SSoT) */
import { dictionarySchema } from '../src/lib/schemas/dictionary.schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_DIR = resolve(__dirname, '..');

// --- PROTOCOLO CROMÁTICO HEIMDALL v2.5 ---
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * @function buildDictionaries
 * @description Ejecuta el pipeline de síntesis de contenido.
 * @pilar X: Performance - Implementa paralelismo de I/O para carga masiva.
 * @pilar VIII: Resiliencia - Captura y reporta fallos a nivel de archivo individual.
 */
async function buildDictionaries(): Promise<void> {
  const startTime = performance.now();
  const traceId = `MACS_${Date.now().toString(36).toUpperCase()}`;

  console.log(`\n${C.magenta}${C.bold}[DNA][MACS]${C.reset} Iniciando síntesis de diccionarios | Trace: ${C.cyan}${traceId}${C.reset}`);

  const msgDir = resolve(APP_DIR, 'src/messages');
  const dictDir = resolve(APP_DIR, 'src/dictionaries');
  
  try {
    await mkdir(dictDir, { recursive: true });
    
    // 1. Identificación de Locales
    const locales = (await readdir(msgDir)).filter(d => !d.startsWith('.'));
    console.log(`   ${C.magenta}→${C.reset} Perímetros detectados: ${C.yellow}${locales.join(', ')}${C.reset}`);

    // 2. Procesamiento Paralelo por Locale
    await Promise.all(locales.map(async (locale) => {
      const localePath = join(msgDir, locale);
      const accumulator: Record<string, unknown> = {};
      const files = (await readdir(localePath)).filter(f => f.endsWith('.json'));

      // Carga concurrente de archivos para este locale
      const fileContents = await Promise.all(
        files.map(async (file) => {
          const filePath = join(localePath, file);
          try {
            const content = await readFile(filePath, 'utf-8');
            return { name: parse(file).name, data: JSON.parse(content) };
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Syntax Error';
            throw new Error(`[CRITICAL] Malformed JSON in ${file}: ${msg}`);
          }
        })
      );

      // Ensamblaje del acumulador
      fileContents.forEach(({ name, data }) => {
        accumulator[name] = data;
      });

      // 3. VALIDACIÓN DE CONTRATO SOBERANO (Zod Audit)
      const validation = dictionarySchema.safeParse(accumulator);

      if (!validation.success) {
        console.error(`\n${C.red}${C.bold}✖ FALLO DE CONTRATO EN [${locale}]:${C.reset}`);
        validation.error.issues.forEach((issue) => {
          console.error(`${C.red}  ↳ Path:${C.reset} ${C.yellow}${issue.path.join('.')}${C.reset} | ${C.red}Msg:${C.reset} ${issue.message}`);
        });
        throw new Error(`MACS_CONTRACT_VIOLATION: ${locale}`);
      }

      // 4. PERSISTENCIA DE ARTEFACTO ENSAMBLADO
      const outputPath = join(dictDir, `${locale}.json`);
      await writeFile(outputPath, JSON.stringify(accumulator, null, 2));
      
      console.log(`   ${C.green}✓ [OK]${C.reset} Nodo ${C.cyan}${locale}${C.reset} sellado y persistido.`);
    }));

    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`\n${C.green}${C.bold}✨ SÍNTESIS COMPLETADA${C.reset} | Latencia: ${C.yellow}${duration}ms${C.reset} | Estado: ${C.green}NOMINAL${C.reset}\n`);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Drift';
    console.error(`\n${C.red}${C.bold}[HEIMDALL][CRITICAL] Pipeline Abortado:${C.reset}`);
    console.error(`   ${C.red}Motivo:${C.reset} ${msg}\n`);
    process.exit(1);
  }
}

// Inicialización del motor
buildDictionaries();