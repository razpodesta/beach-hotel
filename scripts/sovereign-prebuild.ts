/**
 * @file scripts/sovereign-prebuild.ts
 * @description Orquestador de Infraestructura Final (MACS Sync Only).
 * @version 13.0 - Purge Edition
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse, resolve } from 'node:path';
import { dictionarySchema } from '../apps/portfolio-web/src/lib/schemas/dictionary.schema';

const ROOT = process.cwd();
const APP_DIR = resolve(ROOT, 'apps/portfolio-web');

async function buildDictionaries() {
  const msgDir = resolve(APP_DIR, 'src/messages');
  const dictDir = resolve(APP_DIR, 'src/dictionaries');
  await mkdir(dictDir, { recursive: true });
  
  const locales = (await readdir(msgDir)).filter(d => !d.startsWith('.'));
  for (const locale of locales) {
    const localePath = join(msgDir, locale);
    const accumulator: Record<string, unknown> = {};
    const files = (await readdir(localePath)).filter(f => f.endsWith('.json'));

    for (const file of files) {
      accumulator[parse(file).name] = JSON.parse(await readFile(join(localePath, file), 'utf-8'));
    }
    dictionarySchema.parse(accumulator);
    await writeFile(join(dictDir, `${locale}.json`), JSON.stringify(accumulator, null, 2));
  }
}

buildDictionaries().then(() => {
  console.log('✨ [MACS] Diccionarios sincronizados. Pipeline limpio.');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });