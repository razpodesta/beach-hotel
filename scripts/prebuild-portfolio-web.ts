/**
 * @file scripts/prebuild-portfolio-web.ts
 * @description MACS Engine (Master Architecture of Content Sovereignty).
 *              Orquestador soberano de ensamblaje, validación y auditoría i18n.
 *              Refactorizado: Arquitectura de clase, validación atómica por feature
 *              y reporte forense de integridad total.
 * @version 20.0 - MACS Engine & Forensic Stability
 * @author Raz Podestá - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { constants } from 'node:fs';
import { ZodError, type ZodIssue } from 'zod';

/**
 * IMPORTACIONES DE CONTRATO (Soberanía de Tipos)
 * @pilar III: Seguridad de Tipos Absoluta.
 */
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema.js';

// --- CONFIGURACIÓN DE TELEMETRÍA (Protocolo Heimdall) ---
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', red: '\x1b[31m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', magenta: '\x1b[35m', gray: '\x1b[90m',
  blue: '\x1b[34m', white: '\x1b[37m',
};

const ROOT = process.cwd();
const APP_SRC = join(ROOT, 'apps', 'portfolio-web', 'src');
const PATHS = {
  MESSAGES: join(APP_SRC, 'messages'),
  DICTIONARIES: join(APP_SRC, 'dictionaries'),
  REPORTS: join(ROOT, 'reports', 'dictionaries'),
};

/**
 * @interface LocaleAudit
 * @description Contrato para la trazabilidad individual por nodo lingüístico.
 */
interface LocaleAudit {
  locale: string;
  status: 'SUCCESS' | 'FAILED';
  featuresCount: number;
  outputSize: string;
  assembledFeatures: string[];
}

/**
 * @class MACSEngine
 * @description Motor de ingeniería de contenido con validación de frontera.
 */
class MACSEngine {
  private startTime: number = Date.now();
  private audits: LocaleAudit[] = [];
  private issues: string[] = [];

  /**
   * @description Inicializa los perímetros de infraestructura física.
   */
  private async ensurePerimeter(): Promise<void> {
    const directories = [PATHS.DICTIONARIES, PATHS.REPORTS];
    for (const dir of directories) {
      try {
        await access(dir, constants.W_OK);
      } catch {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * @description Realiza el ensamblaje atómico de un idioma.
   */
  private async processLocale(locale: string): Promise<void> {
    console.log(`${C.blue}${C.bold}▶ PROCESANDO NODO: ${locale.toUpperCase()}${C.reset}`);
    
    const localePath = join(PATHS.MESSAGES, locale);
    const files = (await readdir(localePath)).filter(f => f.endsWith('.json'));
    
    const accumulator: Record<string, unknown> = {};
    const features: string[] = [];

    // 1. Ingesta de Fragmentos (MACS Protocol)
    for (const file of files) {
      const featureName = parse(file).name;
      const content = await readFile(join(localePath, file), 'utf-8');
      accumulator[featureName] = JSON.parse(content);
      features.push(featureName);
    }

    // 2. Auditoría contra Contrato Soberano
    try {
      console.log(`   ${C.yellow}🔍 Validando contra Master Schema...${C.reset}`);
      const validated = dictionarySchema.parse(accumulator);
      
      // 3. Persistencia de Artefacto Nivelado
      const outputPath = join(PATHS.DICTIONARIES, `${locale}.json`);
      const outputBuffer = Buffer.from(JSON.stringify(validated, null, 2));
      
      await writeFile(outputPath, outputBuffer);
      
      const sizeKB = (outputBuffer.length / 1024).toFixed(2);
      console.log(`   ${C.green}✓ ARTEFACTO NIVELADO: ${locale}.json (${sizeKB} KB)${C.reset}\n`);

      this.audits.push({
        locale,
        status: 'SUCCESS',
        featuresCount: files.length,
        outputSize: `${sizeKB} KB`,
        assembledFeatures: features
      });

    } catch (err: unknown) {
      this.handleValidationError(locale, err);
    }
  }

  /**
   * @description Gestiona y categoriza errores de validación de frontera.
   */
  private handleValidationError(locale: string, error: unknown): void {
    let message = 'Unknown Corruption';
    
    if (error instanceof ZodError) {
      message = error.issues
        .map((i: ZodIssue) => `[${i.path.join(' -> ')}] ${i.message}`)
        .join(' | ');
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error(`   ${C.red}${C.bold}💥 VIOLACIÓN DE CONTRATO EN [${locale}]:${C.reset}`);
    console.error(`      ${C.red}${message}${C.reset}\n`);

    this.issues.push(`${locale.toUpperCase()}: ${message}`);
    this.audits.push({
      locale,
      status: 'FAILED',
      featuresCount: 0,
      outputSize: '0 KB',
      assembledFeatures: []
    });
  }

  /**
   * @description Ejecuta el ciclo de vida completo del prebuild.
   */
  public async execute(): Promise<void> {
    console.log(`\n${C.magenta}${C.bold}🛡️ [HEIMDALL] INICIANDO MACS ENGINE v20.0${C.reset}`);
    console.log(`${C.gray}Source: ${PATHS.MESSAGES}${C.reset}\n`);

    try {
      await this.ensurePerimeter();
      
      const locales = (await readdir(PATHS.MESSAGES)).filter(d => !d.startsWith('.'));
      
      for (const locale of locales) {
        await this.processLocale(locale);
      }

      const performance = `${((Date.now() - this.startTime) / 1000).toFixed(2)}s`;
      
      // Emisión de Reporte Forense Final
      await writeFile(
        join(PATHS.REPORTS, 'prematch-report.json'),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          globalStatus: this.issues.length === 0 ? 'SUCCESS' : 'FAILED',
          performance,
          audits: this.audits,
          issues: this.issues
        }, null, 2)
      );

      if (this.issues.length > 0) {
        console.log(`${C.red}${C.bold}🚨 BUILD ABORTADO: Ecosistema inconsistente.${C.reset}`);
        process.exit(1);
      }

      console.log(`${C.green}${C.bold}✨ ECOSISTEMA 100% NIVELADO (${performance})${C.reset}\n`);
      process.exit(0);

    } catch (fatal: unknown) {
      const msg = fatal instanceof Error ? fatal.message : 'Engine Crash';
      console.error(`\n${C.red}${C.bold}💥 FALLO CATASTRÓFICO:${C.reset} ${msg}`);
      process.exit(1);
    }
  }
}

// Inicialización del motor
new MACSEngine().execute();