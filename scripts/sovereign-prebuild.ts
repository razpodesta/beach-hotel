/**
 * @file scripts/sovereign-prebuild.ts
 * @description Orquestador de Infraestructura con Motor de Trazabilidad Heimdall v2.5.
 *              Fusiona MACS (i18n) y Payload Artifacts con Watchdog activo.
 *              Optimizado para inmunidad total en Vercel Build Workers y Windows Dev.
 * @version 1.6 - Build-Immune & Forensic Logic
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
  PAYLOAD_BIN: join(ROOT, 'node_modules', '.bin', 'payload')
};

class SovereignPrebuild {
  private totalStart = performance.now();
  private traceId = `trace_prebuild_${Date.now().toString(36).toUpperCase()}`;

  /**
   * PROTOCOLO HEIMDALL: Logger de Métricas con Trazabilidad
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
   * MOTOR DE EJECUCIÓN ASÍNCRONA (Stream-Safe spawn)
   * @fix: Uso de stdio: 'inherit' opcional para evitar bloqueos de búfer en Vercel.
   */
  private async executeSovereignTask(name: string, command: string, args: string[], envVars: Record<string, string>): Promise<void> {
    const start = performance.now();
    console.log(`\n${C.bgBlue}${C.white}  [EXEC] ${name.toUpperCase()}  ${C.reset}`);
    
    return new Promise((resolve, reject) => {
      // Determinamos el comando basándonos en el sistema operativo
      const cmd = process.platform === 'win32' ? `${command}.cmd` : command;

      const child = spawn(cmd, args, { 
        shell: true, 
        env: { ...process.env, ...envVars } 
      });

      // HEARTBEAT: Notificador de vida (Vital para Vercel)
      const heartbeat = setInterval(() => {
        const elapsed = ((performance.now() - start) / 1000).toFixed(0);
        console.log(`    ${C.magenta}⟳ [HEARTBEAT]${C.reset} ${name} procesando... (${elapsed}s)`);
      }, 15000);

      // WATCHDOG: Límite de 3 minutos para evitar consumo de créditos infinito en la nube
      const watchdog = setTimeout(() => {
        child.kill('SIGKILL');
        clearInterval(heartbeat);
        const duration = performance.now() - start;
        this.logMetric(name, duration, 'TIMEOUT', 'Worker se quedó en IDLE');
        reject(new Error(`[WATCHDOG] El proceso ${name} abortado por timeout.`));
      }, 180000);

      // Flujo de salida: Reporte inmediato
      child.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          // Filtrado de ruido de dependencias
          if (!output.includes('node_modules')) {
             console.log(`      ${C.gray}payload >${C.reset} ${output}`);
          }
        }
      });

      child.stderr.on('data', (data) => {
        const err = data.toString().trim();
        if (err) console.error(`      ${C.red}payload_err >${C.reset} ${err}`);
      });

      child.on('close', (code) => {
        clearInterval(heartbeat);
        clearTimeout(watchdog);
        const duration = performance.now() - start;
        
        if (code === 0) {
          this.logMetric(name, duration, 'OK');
          resolve();
        } else {
          this.logMetric(name, duration, 'FAIL', `Exit Code: ${code}`);
          reject(new Error(`${name} falló. Revise los logs de arriba.`));
        }
      });
    });
  }

  /**
   * FASE 1: MACS ENGINE (i18n Aggregator)
   */
  private async buildDictionaries(): Promise<void> {
    
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
          console.error(`\n${C.red}💥 ERROR DE CONTRATO EN [${locale}]:${C.reset}`);
          // Mapeo forense de errores de Zod para reparación instantánea
          err.issues.forEach(i => {
            console.error(`   ↳ PATH: ${C.yellow}${i.path.join('.')}${C.reset} | MSG: ${i.message}`);
          });
          process.exit(1);
        }
      }
    }
  }

  public async execute(): Promise<void> {
    console.log(`\n${C.bgBlue}${C.white}  ORQUESTADOR DE INFRAESTRUCTRURA METASHARK  ${C.reset}`);
    console.log(`${C.gray}  ID: ${this.traceId} | Root: ${ROOT}${C.reset}\n`);

    try {
      // 1. DICCIONARIOS
      await this.buildDictionaries();

      // 2. ARTEFACTOS DE DATOS (PAYLOAD)
      const env = { 
        PAYLOAD_GENERATE: 'true',
        DATABASE_URL: 'postgres://dummy:dummy@127.0.0.1:5432/dummy', // Bucle local para evitar red
        NODE_ENV: 'production'
      };

      // Comando optimizado: usamos npx para garantizar resolución local de binarios
      await this.executeSovereignTask('Sintetizar Tipos TS', 'npx', ['payload', 'generate:types'], env);
      await this.executeSovereignTask('Sincronizar ImportMap', 'npx', ['payload', 'generate:importmap'], env);

      const totalTime = ((performance.now() - this.totalStart) / 1000).toFixed(2);
      console.log(`\n${C.green}${C.bold}✨ PIPELINE FINALIZADO EXITOSAMENTE EN ${totalTime}s${C.reset}\n`);
      process.exit(0);
    } catch (e: any) {
      console.error(`\n${C.red}❌ ANOMALÍA CRÍTICA DETECTADA:${C.reset}`);
      console.error(`   ${e.message || 'Fallo de orquestación de infraestructura'}`);
      process.exit(1);
    }
  }
}

new SovereignPrebuild().execute();