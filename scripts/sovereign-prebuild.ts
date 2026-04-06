/**
 * @file scripts/sovereign-prebuild.ts
 * @description Orquestador de Infraestructura v12.0 (Purged Edition).
 *              Refactorizado: Erradicación de subprocesos de Payload.
 *              Alineado con el estándar oficial de Payload 3.0: Los tipos
 *              y el importMap deben generarse localmente y subirse a Git.
 *              Este script AHORA SOLO consolida los diccionarios i18n.
 * @version 12.0 - Occam's Razor Standard
 * @author Raz Podestá - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', red: '\x1b[31m',
  cyan: '\x1b[36m', magenta: '\x1b[35m', bgBlue: '\x1b[44m', white: '\x1b[37m'
};

const ROOT = process.cwd();
const APP_DIR = resolve(ROOT, 'apps/portfolio-web');

class SovereignPrebuild {
  private traceId = `MACS_${Date.now().toString(36).toUpperCase()}`;

  private async buildDictionaries() {
    console.log(`\n${C.bgBlue}${C.white}  FASE ÚNICA: CONSOLIDACIÓN DE DICCIONARIOS (MACS)  ${C.reset}`);
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

      // Validación SSoT
      dictionarySchema.parse(accumulator);
      await writeFile(join(dictDir, `${locale}.json`), JSON.stringify(accumulator, null, 2));
      console.log(`   ${C.green}✓${C.reset} [${this.traceId}] Nodo ${locale.toUpperCase()} sincronizado | ${(performance.now() - s).toFixed(2)}ms`);
    }
    console.log(`${C.green}✓ DICCIONARIOS ENSAMBLADOS EN ${((performance.now() - start) / 1000).toFixed(2)}s${C.reset}`);
  }

  public async execute() {
    console.log(`\n${C.magenta}${C.bold}🛡️ [HEIMDALL] PREBUILD ENGINE v12.0 (Purged)${C.reset}`);
    try {
      await this.buildDictionaries();
      console.log(`\n${C.green}${C.bold}✨ PREBUILD EXITOSO. CEDIENDO CONTROL A NEXT.JS.${C.reset}\n`);
    } catch (e: any) {
      console.error(`\n${C.red}❌ ANOMALÍA CRÍTICA EN DICCIONARIOS:${C.reset} ${e.message}`);
      process.exit(1);
    }
  }
}

new SovereignPrebuild().execute();