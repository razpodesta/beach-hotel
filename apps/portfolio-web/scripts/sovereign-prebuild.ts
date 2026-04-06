/**
 * @file apps/portfolio-web/scripts/sovereign-prebuild.ts
 * @description Orquestador de Infraestructura Final (MACS Sync Only).
 *              Refactorizado: Erradicación de errores de sintaxis y 
 *              fugas de módulo.
 * @version 14.1 - Syntax Hardened
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dictionarySchema } from '../src/lib/schemas/dictionary.schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APP_DIR = resolve(__dirname, '..');

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
}).catch(e => { 
  console.error('[HEIMDALL][CRITICAL] Fallo en la síntesis de diccionarios:', e); 
  process.exit(1); 
});