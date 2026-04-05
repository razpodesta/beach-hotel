/**
 * @file apps/portfolio-web/src/lib/get-dictionary.ts
 * @description Orquestador Soberano de Carga de Diccionarios (Content Engine).
 *              Implementa Code-Splitting por idioma, caché L1 de servidor y 
 *              Protocolo de Rescate Forense (Double Fallback).
 *              Refactorizado: Saneamiento de tipos (TS2882), optimización 
 *              de resiliencia y telemetría Heimdall v2.0.
 * @version 8.4 - DNA Content Standard (Zero Error Edition)
 * @author Raz Podestá - MetaShark Tech
 */

import 'server-only';

import { i18n, type Locale } from '../config/i18n.config';
import type { Dictionary } from './schemas/dictionary.schema';

/**
 * CONSTANTES CROMÁTICAS (Protocolo Heimdall)
 */
const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

/**
 * CACHÉ L1 DE SERVIDOR
 * @description Previene redundancia de I/O durante el ciclo de vida SSR.
 */
const dictionaryCache = new Map<Locale, Dictionary>();

/**
 * MAPA DE CARGADORES DINÁMICOS
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  'en-US': () => import('../dictionaries/en-US.json').then((module) => module.default as Dictionary),
  'es-ES': () => import('../dictionaries/es-ES.json').then((module) => module.default as Dictionary),
  'pt-BR': () => import('../dictionaries/pt-BR.json').then((module) => module.default as Dictionary),
};

/**
 * MODULE: getDictionary
 * @description Recupera el SSoT de mensajes con telemetría integrada y resiliencia multinivel.
 * @param {Locale} locale - Identificador de idioma.
 * @returns {Promise<Dictionary>} Contrato de contenido validado.
 */
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const start = performance.now();
  const traceId = `dict_sync_${Math.random().toString(36).substring(7)}`;

  try {
    /** 
     * 1. VERIFICACIÓN DE CACHÉ L1
     * @fix @typescript-eslint/no-non-null-assertion: Erradicación del operador '!'.
     */
    const cached = dictionaryCache.get(locale);
    if (cached) return cached;

    console.log(`${C.magenta}${C.bold}[DNA][CONTENT]${C.reset} Handshake iniciado: ${C.cyan}${locale}${C.reset} ${C.dim}| Trace: ${traceId}${C.reset}`);

    // 2. INTENTO DE CARGA PRIMARIA
    const loader = loaders[locale] || loaders[i18n.defaultLocale];
    const dictionary = await loader();

    // 3. PERSISTENCIA EN MEMORIA VOLÁTIL
    dictionaryCache.set(locale, dictionary);

    const duration = (performance.now() - start).toFixed(2);
    console.log(`   ${C.green}✓ [OK]${C.reset} Diccionario hidratado ${C.dim}(${duration}ms)${C.reset}`);

    return dictionary;

  } catch (error: unknown) {
    /**
     * ESTRATEGIA DE RESILIENCIA (Fail-Safe Nivel 2)
     * @pilar VIII: Resiliencia ante falla de disco o archivos corruptos en Vercel.
     */
    const errorMsg = error instanceof Error ? error.message : 'Unknown content drift';
    console.error(`\n${C.red}${C.bold}[CRITICAL][CONTENT] Fallo de Handshake [${locale}]:${C.reset} ${errorMsg}`);

    if (locale !== i18n.defaultLocale) {
      console.warn(`${C.yellow}${C.bold}[RECOVERY]${C.reset} Activando protocolo de rescate hacia el idioma base: ${i18n.defaultLocale}`);
      
      try {
        const fallbackDict = await loaders[i18n.defaultLocale]();
        dictionaryCache.set(i18n.defaultLocale, fallbackDict);
        return fallbackDict;
      } catch (fatalError: unknown) {
        const fatalMsg = fatalError instanceof Error ? fatalError.message : 'Total Infrastructure Collapse';
        console.error(`${C.red}${C.bold}💥 [PANIC] El idioma base es inaccesible: ${fatalMsg}${C.reset}`);
        throw new Error(`[HEIMDALL][FATAL] Core Content Failure: SSoT base [${i18n.defaultLocale}] no respondió.`);
      }
    }

    throw error instanceof Error ? error : new Error(errorMsg);
  }
};

/**
 * @description Purga el caché de diccionarios.
 */
export const clearDictionaryCache = (): void => {
  dictionaryCache.clear();
  console.log(`${C.yellow}[DNA][CONTENT] Cache purged.${C.reset}`);
};