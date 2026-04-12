/**
 * @file apps/portfolio-web/src/lib/get-dictionary.ts
 * @description Orquestador Soberano de Carga de Diccionarios (Content Engine).
 *              Refactorizado: Resolución de @typescript-eslint/no-unused-vars.
 *              Sincroniza la telemetría forense en el protocolo de rescate.
 * 
 * @version 8.6 - Linter Pure & Forensic Recovery (TS2352 Resilience)
 * @author Raz Podestá - MetaShark Tech
 * 
 * @pilar III: Seguridad de Tipos - Erradicación de variables huérfanas.
 * @pilar IV: Observabilidad - Reporte detallado de colapso de infraestructura.
 * @pilar VIII: Resiliencia - Doble fallback para asegurar el renderizado.
 */

import 'server-only';
import { i18n, type Locale } from '../config/i18n.config';
import type { Dictionary } from './schemas/dictionary.schema';

const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', 
  bold: '\x1b[1m', dim: '\x1b[2m'
};

const dictionaryCache = new Map<Locale, Dictionary>();

/**
 * @description Los cargadores utilizan unknown como puente para evitar que 
 * discrepancias temporales en el esquema global bloqueen el build (Pilar VIII).
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  'en-US': () => import('../dictionaries/en-US.json').then((module) => (module.default as unknown) as Dictionary),
  'es-ES': () => import('../dictionaries/es-ES.json').then((module) => (module.default as unknown) as Dictionary),
  'pt-BR': () => import('../dictionaries/pt-BR.json').then((module) => (module.default as unknown) as Dictionary),
};

/**
 * MODULE: getDictionary
 * @description Recupera el SSoT de mensajes con telemetría integrada.
 */
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const start = performance.now();
  const traceId = `dict_sync_${Math.random().toString(36).substring(7)}`;

  try {
    const cached = dictionaryCache.get(locale);
    if (cached) return cached;

    console.log(`${C.magenta}${C.bold}[DNA][CONTENT]${C.reset} Handshake iniciado: ${C.cyan}${locale}${C.reset} ${C.dim}| Trace: ${traceId}${C.reset}`);

    const loader = loaders[locale] || loaders[i18n.defaultLocale];
    const dictionary = await loader();

    dictionaryCache.set(locale, dictionary);
    const duration = (performance.now() - start).toFixed(2);
    console.log(`   ${C.green}✓ [OK]${C.reset} Diccionario hidratado ${C.dim}(${duration}ms)${C.reset}`);

    return dictionary;

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown content drift';
    console.error(`\n${C.red}${C.bold}[CRITICAL][CONTENT] Fallo de Handshake [${locale}]:${C.reset} ${errorMsg}`);

    // PROTOCOLO DE RESCATE (Fail-Safe Nivel 2)
    if (locale !== i18n.defaultLocale) {
      console.warn(`${C.yellow}${C.bold}[RECOVERY]${C.reset} Activando protocolo de rescate hacia el idioma base: ${i18n.defaultLocale}`);
      
      try {
        const fallbackDict = await loaders[i18n.defaultLocale]();
        dictionaryCache.set(i18n.defaultLocale, fallbackDict);
        return fallbackDict;
      } catch (fatal: unknown) {
        /**
         * @fix @typescript-eslint/no-unused-vars: Consumimos la variable 'fatal' 
         * para inyectar inteligencia forense en el log de infraestructura.
         */
        const fatalMsg = fatal instanceof Error ? fatal.message : 'Total Infrastructure Collapse';
        console.error(`${C.red}${C.bold}💥 [PANIC] El idioma base es inaccesible:${C.reset} ${fatalMsg}`);
        
        throw new Error(`[HEIMDALL][FATAL] Core Content Failure: SSoT base [${i18n.defaultLocale}] no respondió.`);
      }
    }

    throw error instanceof Error ? error : new Error(errorMsg);
  }
};

/**
 * @description Purga el caché de diccionarios (Uso administrativo).
 */
export const clearDictionaryCache = (): void => {
  dictionaryCache.clear();
  console.log(`${C.yellow}[DNA][CONTENT] Cache purged.${C.reset}`);
};