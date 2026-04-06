/**
 * @file scripts/sovereign-prebuild.ts
 * @description Orquestador de Infraestructura v11.0 (Isolated Synthesis).
 *              Refactorizado: Inyección del patrón Isolated Synthesis mediante
 *              variables de entorno específicas (NEXT_IGNORE_CONFIG, TS_NODE_PROJECT)
 *              para "cegar" a SWC y evitar el Deadlock de 180s en el Event Loop.
 * @version 11.0 - SWC Blindfold & Event Loop Resilient
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', red: '\x1b[31m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', magenta: '\x1b[35m', bgBlue: '\x1b[44m', white: '\x1b[37m'
};

const ROOT = process.cwd();
const APP_DIR = resolve(ROOT, 'apps/portfolio-web');

class SovereignPrebuild {
  private traceId = `BLD_${Date.now().toString(36).toUpperCase()}`;

  private async buildDictionaries() {
    console.log(`\n${C.magenta}${C.bold}● FASE 1: CONSOLIDACIÓN DE DICCIONARIOS (MACS)${C.reset}`);
    const start = performance.now();
    const msgDir = resolve(APP_DIR, 'src/messages');
    const dictDir = resolve(APP_DIR, 'src/dictionaries');
    await mkdir(dictDir, { recursive: true });
    
    const locales = (await readdir(msgDir)).filter(d => !d.startsWith('.'));
    for (const locale of locales) {
      const s = performance.now();
      const localePath = join(msgDir, locale);
      const accumulator: Record<string, unknown> = {};
      const files = (await readdir(localePath)).filter(f => f.endsWith('.json'));

      for (const file of files) {
        accumulator[parse(file).name] = JSON.parse(await readFile(join(localePath, file), 'utf-8'));
      }

      dictionarySchema.parse(accumulator);
      await writeFile(join(dictDir, `${locale}.json`), JSON.stringify(accumulator, null, 2));
      console.log(`   ${C.green}✓${C.reset} [${this.traceId}] Nodo ${locale.toUpperCase()} sincronizado | ${(performance.now() - s).toFixed(2)}ms`);
    }
    console.log(`${C.green}✓ FASE 1 COMPLETADA EN ${((performance.now() - start) / 1000).toFixed(2)}s${C.reset}`);
  }

  private runWorker(title: string, cmd: string, args: string[]) {
    console.log(`\n${C.bgBlue}${C.white}  FASE: ${title.toUpperCase()}  ${C.reset}`);
    const start = performance.now();

    /**
     * @pilar XIII: Isolated Synthesis Protocol.
     * Inyectamos un entorno de vacío para anestesiar el compilador de Next.js (SWC)
     * y forzar la resolución exclusiva del contexto del CMS, rompiendo el Deadlock.
     */
    const result = spawnSync('pnpm', ['exec', 'payload', cmd, ...args], {
      cwd: ROOT,
      stdio: 'inherit', 
      shell: true,
      env: { 
        ...process.env, 
        HEIMDALL_TRACE_ID: this.traceId,
        PAYLOAD_GENERATE: 'true',
        NODE_ENV: 'development',
        // ⚡ Cegamos a Next.js / SWC
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_IGNORE_CONFIG: 'true',
        NEXT_PRIVATE_LOCAL_WEBPACK: 'true',
        PAYLOAD_DISABLE_IMPORTMAP: 'true',
        // ⚡ Confinamos a TSX al perímetro del CMS
        TS_NODE_PROJECT: resolve(ROOT, 'packages/cms/core/tsconfig.lib.json')
      }
    });

    const dur = ((performance.now() - start) / 1000).toFixed(2);
    if (result.status !== 0) {
      console.error(`\n${C.red}💥 [FAIL] ${title} abortado tras ${dur}s.${C.reset}`);
      process.exit(1);
    }
    console.log(`\n${C.green}✓ [OK] ${title} finalizado en ${dur}s.${C.reset}`);
  }

  public async execute() {
    console.log(`\n${C.bgBlue}${C.white}  HEIMDALL ORCHESTRATOR v11.0 (Isolated Synthesis)  ${C.reset}`);
    try {
      await this.buildDictionaries();

      this.runWorker(
        'Sintetizar Tipos TS', 
        'generate:types', 
        ['--config', 'packages/cms/core/src/payload.generate.config.ts']
      );

      this.runWorker(
        'Sincronizar ImportMap', 
        'generate:importmap', 
        ['--config', 'packages/cms/core/src/payload.config.ts']
      );

      console.log(`\n${C.green}${C.bold}✨ ECOSISTEMA SINCRONIZADO EXITOSAMENTE.${C.reset}\n`);
    } catch (e: any) {
      console.error(`\n${C.red}❌ ANOMALÍA CRÍTICA:${C.reset} ${e.message}`);
      process.exit(1);
    }
  }
}

new SovereignPrebuild().execute();