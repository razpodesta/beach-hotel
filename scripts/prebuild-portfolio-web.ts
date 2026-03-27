/**
 * @file scripts/prebuild-portfolio-web.ts
 * @description Orquestador Soberano de Ensamblaje y Auditoría Forense (i18n).
 *              Implementa validación simétrica contra Master Schema y genera
 *              reportes de integridad linter-clean para Vercel.
 * @version 19.0 - Node 22 Clean Exit & Zero Any Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { constants } from 'node:fs';
import { ZodError, type ZodIssue } from 'zod';

/**
 * IMPORTACIONES DE CONTRATO (Soberanía de Tipos)
 * @pilar V: Adherencia arquitectónica a las fronteras de Nx.
 */
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

/**
 * @interface LocaleAudit
 * @description Contrato para la trazabilidad individual por idioma.
 */
interface LocaleAudit {
  locale: string;
  status: 'SUCCESS' | 'FAILED';
  featuresCount: number;
  errors: number;
  outputSize?: string;
  postWriteVerification: 'PASSED' | 'FAILED';
  assembledFeatures: string[];
}

/**
 * @interface ForensicReport
 * @description Estructura final del artefacto de auditoría.
 */
interface ForensicReport {
  timestamp: string;
  globalStatus: 'SUCCESS' | 'FAILED';
  localesAudited: LocaleAudit[];
  issues: string[];
  performance: string;
}

/**
 * @description Valida la existencia física y permisos de un directorio.
 * @pilar VIII: Resiliencia - Prevención de fallos de I/O.
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
  console.log(`\n${C.magenta}${C.bold}🛡️ [HEIMDALL] INICIANDO PROTOCOLO DE AUDITORÍA Y ENSAMBLAJE (v19.0)${C.reset}`);
  console.log(`${C.gray}Source Path    : ${MESSAGES_DIR}${C.reset}\n`);

  const auditReport: ForensicReport = {
    timestamp: new Date().toISOString(),
    globalStatus: 'SUCCESS',
    localesAudited: [],
    issues: [],
    performance: '0s'
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
      const featuresLoaded: string[] = [];
      let localErrorCount = 0;

      // FASE 2.1: Ingesta en Memoria (Atomic Read)
      for (const file of featureFiles) {
        const featureName = parse(file).name;
        try {
          const rawContent = await readFile(join(localePath, file), 'utf-8');
          memoryDictionary[featureName] = JSON.parse(rawContent);
          featuresLoaded.push(featureName);
        } catch (err: unknown) {
          localErrorCount++;
          const msg = err instanceof Error ? err.message : 'Invalid JSON structure';
          console.error(`   ${C.red}✗ FALLO ESTRUCTURAL EN [${file}]:${C.reset} ${msg}`);
          auditReport.issues.push(`${locale}/${file}: ${msg}`);
        }
      }

      // FASE 2.2: Auditoría contra Contrato Soberano (Zod Validation)
      try {
        console.log(`   ${C.yellow}🔍 Validando integridad Zod...${C.reset}`);
        const validatedData = dictionarySchema.parse(memoryDictionary);
        
        // FASE 2.3: Persistencia de Artefacto
        const outputPath = join(DEST_DIR, `${locale}.json`);
        const jsonOutput = JSON.stringify(validatedData, null, 2);
        
        await writeFile(outputPath, jsonOutput);
        
        // FASE 2.4: Verificación Post-Escritura (Erradicación de Drift)
        const metaRes = await readFile(outputPath, 'utf-8');
        const finalAudit = dictionarySchema.safeParse(JSON.parse(metaRes));

        if (!finalAudit.success) throw new Error('DATA_DRIFT_DETECTED_ON_STORAGE');

        const size = Buffer.byteLength(jsonOutput);
        console.log(`   ${C.green}✓ ARTEFACTO NIVELADO: ${locale}.json (${formatForensicSize(size)})${C.reset}\n`);

        auditReport.localesAudited.push({
          locale,
          status: 'SUCCESS',
          featuresCount: featureFiles.length,
          errors: localErrorCount,
          outputSize: formatForensicSize(size),
          postWriteVerification: 'PASSED',
          assembledFeatures: featuresLoaded
        });

      } catch (err: unknown) {
        auditReport.globalStatus = 'FAILED';
        let errorMessage = 'Unknown corruption';

        if (err instanceof ZodError) {
          errorMessage = err.issues
            .map((i: ZodIssue) => `[${i.path.join(' -> ')}] ${i.message}`)
            .join(' | ');
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        console.error(`   ${C.red}${C.bold}💥 VIOLACIÓN DE CONTRATO EN [${locale}]:${C.reset}`);
        console.error(`      ${C.red}${errorMessage}${C.reset}\n`);

        auditReport.localesAudited.push({
          locale,
          status: 'FAILED',
          featuresCount: featureFiles.length,
          errors: localErrorCount + 1,
          postWriteVerification: 'FAILED',
          assembledFeatures: featuresLoaded
        });
      }
    }

    // 3. Cierre y Emisión de Reporte Forense
    const endTime = Date.now();
    auditReport.performance = `${((endTime - startTime) / 1000).toFixed(2)}s`;
    
    await writeFile(
      join(REPORT_DIR, 'prematch-report.json'), 
      JSON.stringify(auditReport, null, 2)
    );

    if (auditReport.globalStatus === 'FAILED') {
      console.log(`${C.red}${C.bold}🚨 BUILD ABORTADO: El ecosistema i18n no es íntegro.${C.reset}`);
      process.exit(1);
    }

    console.log(`${C.green}${C.bold}✨ ECOSISTEMA 100% NIVELADO (${auditReport.performance})${C.reset}\n`);
    process.exit(0);

  } catch (fatal: unknown) {
    const msg = fatal instanceof Error ? fatal.message : 'Engine critical failure';
    console.error(`\n${C.red}${C.bold}💥 FALLO CATASTRÓFICO EN EL ENGINE:${C.reset}\n`, msg);
    process.exit(1);
  }
}

runForensicBuild();