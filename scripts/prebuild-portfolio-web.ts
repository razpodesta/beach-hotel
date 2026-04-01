/**
 * @file scripts/prebuild-portfolio-web.ts
 * @description MACS Engine v21.0: Orquestador soberano de i18n.
 *              Implementa caché de estado para evitar duplicidad de ejecución
 *              y validación robusta ante corrupción de datos.
 * @version 21.0 - Idempotent & Deterministic
 * @author Staff Engineer - MetaShark Tech
 */

import { mkdir, readdir, readFile, writeFile, access, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { constants } from 'node:fs';
import { ZodError } from 'zod';
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema.js';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', red: '\x1b[31m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', magenta: '\x1b[35m', gray: '\x1b[90m',
};

const ROOT = process.cwd();
const PATHS = {
  MESSAGES: join(ROOT, 'apps', 'portfolio-web', 'src', 'messages'),
  DICTIONARIES: join(ROOT, 'apps', 'portfolio-web', 'src', 'dictionaries'),
  REPORTS: join(ROOT, 'reports', 'dictionaries'),
};

class MACSEngine {
  private async shouldRebuild(localePath: string, outputPath: string): Promise<boolean> {
    try {
      const outputStat = await stat(outputPath);
      const messagesDir = await readdir(localePath);
      for (const file of messagesDir) {
        const m = await stat(join(localePath, file));
        if (m.mtime > outputStat.mtime) return true;
      }
      return false;
    } catch { return true; }
  }

  private async processLocale(locale: string): Promise<boolean> {
    const localePath = join(PATHS.MESSAGES, locale);
    const outputPath = join(PATHS.DICTIONARIES, `${locale}.json`);
    
    if (!(await this.shouldRebuild(localePath, outputPath))) {
      console.log(`   ${C.gray}○ NODO ${locale.toUpperCase()}: CACHE_HIT (Saltando)${C.reset}`);
      return true;
    }

    const files = (await readdir(localePath)).filter(f => f.endsWith('.json'));
    const accumulator: Record<string, unknown> = {};

    for (const file of files) {
      const featureName = parse(file).name;
      const content = await readFile(join(localePath, file), 'utf-8');
      try {
        accumulator[featureName] = JSON.parse(content);
      } catch (e) {
        throw new Error(`JSON_CORRUPT: ${file}`);
      }
    }

    try {
      const validated = dictionarySchema.parse(accumulator);
      await writeFile(outputPath, JSON.stringify(validated, null, 2));
      console.log(`   ${C.green}✓ NODO ${locale.toUpperCase()}: SINCRONIZADO${C.reset}`);
      return true;
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        console.error(`   ${C.red}💥 VIOLACIÓN CONTRATO [${locale}]: ${err.issues.map(i => i.path.join('.')).join(', ')}${C.reset}`);
      }
      return false;
    }
  }

  public async execute(): Promise<void> {
    console.log(`${C.magenta}${C.bold}🛡️ [HEIMDALL] MACS ENGINE v21.0${C.reset}`);
    await mkdir(PATHS.DICTIONARIES, { recursive: true });
    await mkdir(PATHS.REPORTS, { recursive: true });

    const locales = (await readdir(PATHS.MESSAGES)).filter(d => !d.startsWith('.'));
    let hasFailed = false;

    for (const locale of locales) {
      const success = await this.processLocale(locale);
      if (!success) hasFailed = true;
    }

    if (hasFailed) process.exit(1);
    console.log(`${C.green}${C.bold}✨ ECOSISTEMA 100% NIVELADO${C.reset}\n`);
    process.exit(0);
  }
}

new MACSEngine().execute();