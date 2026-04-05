/**
 * @file scripts/sovereign-prebuild.ts
 * @description Orquestador de Infraestructura con Motor de Trazabilidad Heimdall v2.0.
 *              Implementa ejecución asíncrona, latidos de sistema (Heartbeat) 
 *              y Watchdog para detectar y abortar bloqueos de infraestructura.
 * @version 1.5 - Heimdall Forensic Watchdog & Performance Metrics
 * @author Staff Engineer - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { spawn } from 'node:child_process';
import { ZodError } from 'zod';

/** 
 * IMPORTACIONES DE CONTRATO (SSoT) 
 */
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', red: '\x1b[31m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', magenta: '\x1b[35m', gray: '\x1b[90m',
  bgBlue: '\x1b[44m', white: '\x1b[37m', pulse: '\x1b[5m'
};

const ROOT = process.cwd();
const PATHS = {
  MESSAGES: join(ROOT, 'apps', 'portfolio-web', 'src', 'messages'),
  DICTIONARIES: join(ROOT, 'apps', 'portfolio-web', 'src', 'dictionaries'),
};

class SovereignPrebuild {
  private totalStart = performance.now();
  private traceId = `trace_prebuild_${Date.now().toString(36)}`;

  /**
   * PROTOCOLO HEIMDALL: Logger de Métricas
   */
  private logMetric(action: string, duration: number, status: 'OK' | 'FAIL' | 'TIMEOUT', details?: string) {
    const color = status === 'OK' ? C.green : C.red;
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
    
    console.log(
      `${C.gray}[${timestamp}]${C.reset} ` +
      `${C.cyan}[${this.traceId}]${C.reset} ` +
      `${action.padEnd(35)} | ` +
      `${color}${status.padEnd(8)}${C.reset} | ` +
      `${C.yellow}${duration.toFixed(2).padStart(8)}ms${C.reset}` +
      (details ? ` | ${C.gray}${details}${C.reset}` : '')
    );
  }

  /**
   * MOTOR DE EJECUCIÓN ASÍNCRONA (Non-Blocking Stream)
   */
  private async executeSovereignTask(name: string, command: string, args: string[], envVars: Record<string, string>): Promise<void> {
    const start = performance.now();
    console.log(`\n${C.bgBlue}${C.white}  [START] ${name.toUpperCase()}  ${C.reset}`);
    
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { 
        shell: true, 
        env: { ...process.env, ...envVars } 
      });

      // HEARTBEAT: Notificador de vida cada 10 segundos para procesos largos
      const heartbeat = setInterval(() => {
        const elapsed = ((performance.now() - start) / 1000).toFixed(0);
        console.log(`    ${C.magenta}⟳ [HEARTBEAT]${C.reset} ${name} en ejecución... (${elapsed}s)`);
      }, 10000);

      // WATCHDOG: Abortar si el proceso excede los 3 minutos (Límite de build sano)
      const watchdog = setTimeout(() => {
        child.kill();
        clearInterval(heartbeat);
        const duration = performance.now() - start;
        this.logMetric(name, duration, 'TIMEOUT', 'Infraestructura bloqueada');
        reject(new Error(`[WATCHDOG] El proceso ${name} ha excedido el tiempo límite de seguridad.`));
      }, 180000);

      child.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) console.log(`      ${C.gray}payload >${C.reset} ${output}`);
      });

      child.stderr.on('data', (data) => {
        console.error(`      ${C.red}payload_err >${C.reset} ${data.toString().trim()}`);
      });

      child.on('close', (code) => {
        clearInterval(heartbeat);
        clearTimeout(watchdog);
        const duration = performance.now() - start;
        
        if (code === 0) {
          this.logMetric(name, duration, 'OK');
          resolve();
        } else {
          this.logMetric(name, duration, 'FAIL', `Código de salida: ${code}`);
          reject(new Error(`${name} falló con código ${code}`));
        }
      });
    });
  }

  /**
   * FASE 1: MACS ENGINE (Consolidación de Identidades i18n)
   */
  private async buildDictionaries(): Promise<void> {
    const start = performance.now();
    console.log(`\n${C.magenta}${C.bold}● FASE 1: CONSOLIDACIÓN DE DICCIONARIOS (MACS)${C.reset}`);
    
    await mkdir(PATHS.DICTIONARIES, { recursive: true });
    const locales = (await readdir(PATHS.MESSAGES)).filter(d => !d.startsWith('.'));

    for (const locale of locales) {
      const localeStart = performance.now();
      const localePath = join(PATHS.MESSAGES, locale);
      const accumulator: Record<string, unknown> = {};
      const files = (await readdir(localePath)).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const content = await readFile(join(localePath, file), 'utf-8');
        accumulator[parse(file).name] = JSON.parse(content);
      }

      try {
        const validated = dictionarySchema.parse(accumulator);
        await writeFile(join(PATHS.DICTIONARIES, `${locale}.json`), JSON.stringify(validated, null, 2));
        this.logMetric(`Sync Nodo ${locale.toUpperCase()}`, performance.now() - localeStart, 'OK');
      } catch (err) {
        if (err instanceof ZodError) {
          this.logMetric(`Sync Nodo ${locale.toUpperCase()}`, performance.now() - localeStart, 'FAIL', 'Esquema inválido');
          throw err;
        }
      }
    }
    console.log(`${C.gray}  [INFO] MACS Engine completado en ${(performance.now() - start).toFixed(2)}ms${C.reset}`);
  }

  public async execute(): Promise<void> {
    console.log(`\n${C.bgBlue}${C.white}  ORQUESTADOR DE INFRAESTRUCTRURA METASHARK  ${C.reset}`);
    console.log(`${C.gray}  Trace ID: ${this.traceId} | Root: ${ROOT}${C.reset}\n`);

    try {
      // 1. DICCIONARIOS
      await this.buildDictionaries();

      // 2. ARTEFACTOS DE DATOS (PAYLOAD)
      const env = { 
        PAYLOAD_GENERATE: 'true',
        DATABASE_URL: 'postgres://dummy:dummy@localhost:5432/dummy', // Evitar conexión real
        NODE_ENV: 'production'
      };

      await this.executeSovereignTask('Generar Tipos TS', 'pnpm', ['payload', 'generate:types'], env);
      await this.executeSovereignTask('Sincronizar ImportMap', 'pnpm', ['payload', 'generate:importmap'], env);

      const totalTime = (performance.now() - this.totalStart) / 1000;
      console.log(`\n${C.green}${C.bold}✨ PIPELINE FINALIZADO EXITOSAMENTE EN ${totalTime.toFixed(2)}s${C.reset}\n`);
      process.exit(0);
    } catch (e: any) {
      console.error(`\n${C.red}❌ ANOMALÍA CRÍTICA DETECTADA:${C.reset}`);
      console.error(`   ${e.message || 'Error desconocido en el pipeline'}`);
      process.exit(1);
    }
  }
}

new SovereignPrebuild().execute();