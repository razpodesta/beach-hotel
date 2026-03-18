/**
 * @file scripts/prebuild-portfolio-web.ts
 * @description Orquestador Soberano de Ensamblaje y Auditoría Forense (i18n).
 *              Ensambla, valida en memoria, escribe en disco y realiza una 
 *              verificación Post-Escritura contra el Master Schema.
 * @version 17.0 - Ultra-Verbose & Post-Write Verification Edition
 * @author Raz Podestá - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { ZodError, type ZodIssue } from 'zod';

/**
 * IMPORTACIONES DE CONTRATO (Fronteras Nx)
 * @pilar V: Adherencia Arquitectónica.
 * Desactivamos la regla de límites de módulo explícitamente en esta línea 
 * para permitir que el script de pre-build consuma la fuente de verdad (SSoT) de la app.
 */
// eslint-disable-next-line @nx/enforce-module-boundaries
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema.js';

/**
 * CONFIGURACIÓN DE TELEMETRÍA (Colores ANSI)
 * @fix TS2339: Agregado el color 'white' faltante.
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
const MESSAGES_DIR = join(ROOT, 'apps', 'portfolio-web', 'src', 'messages');
const DEST_DIR = join(ROOT, 'apps', 'portfolio-web', 'src', 'dictionaries');
const REPORT_DIR = join(ROOT, 'reports', 'dictionaries');

interface AuditIssue {
  locale: string;
  feature: string;
  issue: string;
  severity: 'CRITICAL' | 'WARNING';
}

interface LocaleAudit {
  locale: string;
  status: 'SUCCESS' | 'FAILED';
  featuresCount: number;
  assembledFeatures: string[];
  errors: number;
  outputSize?: string;
  postWriteVerification: 'PASSED' | 'FAILED' | 'SKIPPED';
}

/**
 * @description Formatea bytes a tamaño humano para la telemetría de performance.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * @description Ejecuta el pipeline de ensamblaje con visión holística ultra-verbosa.
 * @pilar IV: Observabilidad Hiper-Granular (Protocolo Heimdall).
 */
async function runForensicBuild(): Promise<void> {
  const startTime = Date.now();
  console.log(`\n${C.magenta}${C.bold}🛡️ [HEIMDALL] INICIANDO PROTOCOLO DE AUDITORÍA Y ENSAMBLAJE (v17.0)${C.reset}`);
  console.log(`${C.gray}Directorio Raíz  : ${ROOT}${C.reset}`);
  console.log(`${C.gray}Origen (Messages): ${MESSAGES_DIR}${C.reset}`);
  console.log(`${C.gray}Destino (Dicts)  : ${DEST_DIR}${C.reset}\n`);

  const report = {
    timestamp: new Date().toISOString(),
    globalStatus: 'PENDING',
    localesAudited: [] as LocaleAudit[],
    issues: [] as AuditIssue[],
    performance: ''
  };

  try {
    // 1. Preparación de Infraestructura Física
    await mkdir(REPORT_DIR, { recursive: true });
    await mkdir(DEST_DIR, { recursive: true });

    // 2. Descubrimiento de Locales
    const locales = (await readdir(MESSAGES_DIR)).filter(d => !d.startsWith('.'));
    console.log(`${C.cyan}${C.bold}🌐 IDIOMAS DETECTADOS EN EL ECOSISTEMA:${C.reset} ${C.white}${locales.join(', ')}${C.reset}\n`);
    
    for (const locale of locales) {
      console.log(`${C.blue}${C.bold}▶===================================================${C.reset}`);
      console.log(`${C.blue}${C.bold}▶ PROCESANDO IDIOMA: ${locale.toUpperCase()}${C.reset}`);
      console.log(`${C.blue}${C.bold}▶===================================================${C.reset}`);
      
      const localePath = join(MESSAGES_DIR, locale);
      const featureFiles = (await readdir(localePath)).filter(f => f.endsWith('.json'));
      
      const localeDictionary: Record<string, unknown> = {};
      const assembledList: string[] =[];
      let localErrors = 0;

      // FASE 2.1: Ensamblaje en Memoria
      console.log(`\n   ${C.yellow}📦 Fase 1: Extracción y Ensamblaje en Memoria...${C.reset}`);
      
      await Promise.all(featureFiles.map(async (file) => {
        const featureName = parse(file).name;
        const filePath = join(localePath, file);
        
        try {
          const content = await readFile(filePath, 'utf-8');
          localeDictionary[featureName] = JSON.parse(content);
          assembledList.push(featureName);
          console.log(`   ${C.green}✓${C.reset} ${C.gray}Aparato extraído:${C.reset} ${C.white}${featureName}${C.reset}`);
        } catch (err: unknown) {
          localErrors++;
          const msg = err instanceof Error ? err.message : 'JSON Malformado';
          report.issues.push({ locale, feature: file, issue: msg, severity: 'CRITICAL' });
          console.error(`   ${C.red}✗ ERROR CRÍTICO [${file}]:${C.reset} ${msg}`);
        }
      }));

      // FASE 2.2: Validación SSoT en Memoria
      console.log(`\n   ${C.yellow}🔍 Fase 2: Escaneando integridad del contrato Zod en memoria...${C.reset}`);
      try {
        dictionarySchema.parse(localeDictionary);
        console.log(`   ${C.green}✓ Contrato de memoria validado con éxito.${C.reset}`);
        
        // FASE 2.3: Escritura en Disco (I/O)
        const outputPath = join(DEST_DIR, `${locale}.json`);
        const jsonContent = JSON.stringify(localeDictionary, null, 2);
        
        console.log(`\n   ${C.yellow}💾 Fase 3: Escribiendo artefacto en disco...${C.reset}`);
        await writeFile(outputPath, jsonContent);
        const stats = await stat(outputPath);
        console.log(`   ${C.green}✓ Archivo físico creado: ${C.white}${locale}.json (${formatBytes(stats.size)})${C.reset}`);

        // FASE 2.4: Verificación Post-Escritura (Lectura y Re-validación)
        console.log(`\n   ${C.cyan}🔬 Fase 4: Verificación Post-Escritura (Post-Write Audit)...${C.reset}`);
        const writtenContent = await readFile(outputPath, 'utf-8');
        const parsedWrittenContent = JSON.parse(writtenContent);
        dictionarySchema.parse(parsedWrittenContent);
        console.log(`   ${C.green}${C.bold}✓ INTEGRIDAD CONFIRMADA: El artefacto en disco es 100% puro.${C.reset}\n`);

        report.localesAudited.push({
          locale,
          status: 'SUCCESS',
          featuresCount: featureFiles.length,
          assembledFeatures: assembledList,
          errors: localErrors,
          outputSize: formatBytes(stats.size),
          postWriteVerification: 'PASSED'
        });
        
      } catch (err: unknown) {
        localErrors++;
        let detail = 'Violación de contrato estructural';
        
        if (err instanceof ZodError) {
          detail = err.issues
            .map((issue: ZodIssue) => `[${issue.path.join(' → ')}] ${issue.message}`)
            .join(' | ');
        }
        
        report.issues.push({ locale, feature: 'Master Dictionary', issue: detail, severity: 'CRITICAL' });
        report.localesAudited.push({
          locale,
          status: 'FAILED',
          featuresCount: featureFiles.length,
          assembledFeatures: assembledList,
          errors: localErrors,
          postWriteVerification: 'FAILED'
        });
        
        console.error(`   ${C.red}${C.bold}💥 FALLO DE CONTRATO O I/O EN [${locale}]:${C.reset}`);
        console.error(`      ${C.red}${detail}${C.reset}\n`);
      }
    }

    // 4. Cierre de Operación y Reporte JSON Verboso
    const totalErrors = report.issues.length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    report.performance = `${duration}s`;
    report.globalStatus = totalErrors === 0 ? 'SUCCESS' : 'FAILED';

    const reportPath = join(REPORT_DIR, 'prematch-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));

    // 5. CUADRO DE MANDO EJECUTIVO (Consola)
    console.log(`${C.magenta}====================================================${C.reset}`);
    console.log(`${C.magenta}${C.bold}   RESUMEN EJECUTIVO DE PRE-CONSTRUCCIÓN${C.reset}`);
    console.log(`${C.magenta}====================================================${C.reset}`);
    
    report.localesAudited.forEach(stat => {
      const color = stat.status === 'SUCCESS' ? C.green : C.red;
      const statusIcon = stat.status === 'SUCCESS' ? '✔' : '✖';
      
      console.log(
        `${C.bold}${stat.locale.toUpperCase()}${C.reset}: ${color}${statusIcon} ${stat.status}${C.reset} ` +
        `| Peso: ${C.white}${stat.outputSize || 'N/A'}${C.reset} ` +
        `| Verificación Disco: ${C.cyan}${stat.postWriteVerification}${C.reset}`
      );
      console.log(`${C.gray}   ↳ Aparatos Ensamblados (${stat.featuresCount}): ${stat.assembledFeatures.join(', ')}${C.reset}`);
      
      if (stat.errors > 0) {
        console.log(`${C.red}   ↳ Errores detectados: ${stat.errors}${C.reset}`);
      }
    });

    console.log(`\n${C.gray}Tiempo de ejecución : ${C.white}${duration}s${C.reset}`);
    console.log(`${C.gray}Reporte forense (JSON): ${C.cyan}${reportPath}${C.reset}\n`);

    if (totalErrors > 0) {
      console.log(`${C.red}${C.bold}🚨 OPERACIÓN ABORTADA: Se detectaron ${totalErrors} fallas de integridad.${C.reset}`);
      process.exit(1);
    }

    console.log(`${C.green}${C.bold}✅ ECOSISTEMA 100% NIVELADO: Todos los diccionarios fueron ensamblados, escritos y re-verificados correctamente en disco.${C.reset}\n`);
    process.exit(0);

  } catch (error: unknown) {
    console.error(`\n${C.red}${C.bold}💥 FALLO CATASTRÓFICO EN EL PIPELINE:${C.reset}`, error);
    process.exit(1);
  }
}

runForensicBuild();