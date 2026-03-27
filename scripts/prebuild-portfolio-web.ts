/**
 * @file scripts/prebuild-portfolio-web.ts
 * @description Orquestador Soberano de Ensamblaje y Auditoría Forense (i18n).
 *              Implementa validación simétrica contra Master Schema, erradicación
 *              de avisos DEP0180 y generación de reportes de integridad.
 * @version 18.0 - Node 22 Native Sync & Path Hardening
 * @author Raz Podestá - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { constants } from 'node:fs';
import { ZodError, type ZodIssue } from 'zod';

/**
 * IMPORTACIONES DE CONTRATO (Soberanía de Tipos)
 * @pilar V: Eliminación de extensiones .js para resolución nativa en pipeline de Nx.
 */
// eslint-disable-next-line @nx/enforce-module-boundaries
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema';

/**
 * CONFIGURACIÓN DE TELEMETRÍA (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

const ROOT = process.cwd();
const APP_PATH = join(ROOT, 'apps', 'portfolio-web', 'src');
const MESSAGES_DIR = join(APP_PATH, 'messages');
const DEST_DIR = join(APP_PATH, 'dictionaries');
const REPORT_DIR = join(ROOT, 'reports', 'dictionaries');

interface LocaleAudit {
  locale: string;
  status: 'SUCCESS' | 'FAILED';
  featuresCount: number;
  errors: number;
  outputSize?: string;
  postWriteVerification: 'PASSED' | 'FAILED';
}

/**
 * @description Valida la existencia física y permisos de un directorio.
 * @pilar VIII: Resiliencia - Prevención de fallos de I/O en Vercel.
 */
async function ensureDirectorySovereignty(path: string): Promise<void> {
  try {
    await access(path, constants.R_OK | constants.W_OK);
  } catch {
    await mkdir(path, { recursive: true });
  }
}

/**
 * @description Formatea bytes para telemetría forense.
 */
function formatForensicSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * APARATO PRINCIPAL: runForensicBuild
 * @description Ejecuta la purificación y ensamblaje del ecosistema de contenido.
 */
async function runForensicBuild(): Promise<void> {
  const startTime = Date.now();
  console.log(`\n${C.magenta}${C.bold}🛡️ [HEIMDALL] INICIANDO PROTOCOLO DE AUDITORÍA Y ENSAMBLAJE (v18.0)${C.reset}`);
  console.log(`${C.gray}Node Runtime   : ${process.version}${C.reset}`);
  console.log(`${C.gray}Source Path    : ${MESSAGES_DIR}${C.reset}\n`);

  const auditReport = {
    timestamp: new Date().toISOString(),
    globalStatus: 'SUCCESS',
    details: [] as LocaleAudit[],
    violations: [] as any[]
  };

  try {
    // 1. Preparación de Perímetro
    await Promise.all([
      ensureDirectorySovereignty(REPORT_DIR),
      ensureDirectorySovereignty(DEST_DIR)
    ]);

    // 2. Descubrimiento de Dominios Lingüísticos
    const locales = (await readdir(MESSAGES_DIR)).filter(d => !d.startsWith('.'));
    console.log(`${C.cyan}${C.bold}🌐 ECOSISTEMA DETECTADO:${C.reset} ${C.white}${locales.join(' | ')}${C.reset}\n`);
    
    for (const locale of locales) {
      console.log(`${C.blue}${C.bold}▶ PROCESANDO: ${locale.toUpperCase()}${C.reset}`);
      
      const localePath = join(MESSAGES_DIR, locale);
      const featureFiles = (await readdir(localePath)).filter(f => f.endsWith('.json'));
      
      const memoryDictionary: Record<string, unknown> = {};
      let localErrorCount = 0;

      // FASE 2.1: Ingesta en Memoria (Atomic Read)
      await Promise.all(featureFiles.map(async (file) => {
        const featureName = parse(file).name;
        try {
          const rawContent = await readFile(join(localePath, file), 'utf-8');
          memoryDictionary[featureName] = JSON.parse(rawContent);
        } catch (err: any) {
          localErrorCount++;
          console.error(`   ${C.red}✗ FALLO ESTRUCTURAL EN [${file}]:${C.reset} ${err.message}`);
        }
      }));

      // FASE 2.2: Auditoría contra Contrato Soberano (Zod Validation)
      try {
        console.log(`   ${C.yellow}🔍 Validando integridad Zod...${C.reset}`);
        const validatedData = dictionarySchema.parse(memoryDictionary);
        
        // FASE 2.3: Persistencia de Artefacto
        const outputPath = join(DEST_DIR, `${locale}.json`);
        const jsonOutput = JSON.stringify(validatedData, null, 2);
        
        await writeFile(outputPath, jsonOutput);
        
        // FASE 2.4: Verificación Post-Escritura (Erradicación DEP0180)
        // Ya no instanciamos 'new Stats()', usamos la lectura directa de metadatos.
        const metaRes = await readFile(outputPath, 'utf-8');
        const finalAudit = dictionarySchema.safeParse(JSON.parse(metaRes));

        if (!finalAudit.success) throw new Error('DATA_DRIFT_AFTER_WRITE');

        const size = Buffer.byteLength(jsonOutput);
        console.log(`   ${C.green}✓ ARTEFACTO NIVELADO: ${locale}.json (${formatForensicSize(size)})${C.reset}\n`);

        auditReport.details.push({
          locale,
          status: 'SUCCESS',
          featuresCount: featureFiles.length,
          errors: localErrorCount,
          outputSize: formatForensicSize(size),
          postWriteVerification: 'PASSED'
        });

      } catch (err: unknown) {
        auditReport.globalStatus = 'FAILED';
        let errorMessage = 'Unknown corruption';

        if (err instanceof ZodError) {
          errorMessage = err.issues
            .map((i: ZodIssue) => `[${i.path.join(' -> ')}] ${i.message}`)
            .join(' | ');
        }

        console.error(`   ${C.red}${C.bold}💥 VIOLACIÓN DE CONTRATO EN [${locale}]:${C.reset}`);
        console.error(`      ${C.red}${errorMessage}${C.reset}\n`);

        auditReport.details.push({
          locale,
          status: 'FAILED',
          featuresCount: featureFiles.length,
          errors: localErrorCount + 1,
          postWriteVerification: 'FAILED'
        });
      }
    }

    // 3. Cierre y Emisión de Reporte Forense
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    await writeFile(
      join(REPORT_DIR, 'prematch-report.json'), 
      JSON.stringify(auditReport, null, 2)
    );

    if (auditReport.globalStatus === 'FAILED') {
      console.log(`${C.red}${C.bold}🚨 BUILD ABORTADO: El ecosistema i18n no es íntegro.${C.reset}`);
      process.exit(1);
    }

    console.log(`${C.green}${C.bold}✨ ECOSISTEMA 100% NIVELADO (${duration}s)${C.reset}\n`);
    process.exit(0);

  } catch (fatal: any) {
    console.error(`\n${C.red}${C.bold}💥 FALLO CATASTRÓFICO EN EL ENGINE:${C.reset}\n`, fatal);
    process.exit(1);
  }
}

runForensicBuild();