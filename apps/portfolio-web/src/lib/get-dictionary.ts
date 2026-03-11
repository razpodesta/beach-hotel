/**
 * @file apps/portfolio-web/src/lib/get-dictionary.ts
 * @description Orquestador soberano para la carga de diccionarios i18n. 
 *              Implementa Code-Splitting a nivel de servidor y un sistema de 
 *              resiliencia con doble fallback.
 * @version 7.0
 * @author Raz Podestá - MetaShark Tech
 */

import 'server-only';

// IMPORTACIONES NIVELADAS (Cumplimiento @nx/enforce-module-boundaries)
import { i18n, type Locale } from '../config/i18n.config';
import type { Dictionary } from './schemas/dictionary.schema';

/**
 * Mapa estático de cargadores dinámicos.
 * El uso de promesas aisladas permite a Next.js optimizar la memoria del servidor
 * cargando solo el JSON necesario para la solicitud activa.
 */
const dictionaryLoaders: Record<Locale, () => Promise<Dictionary>> = {
  'en-US': () => import('../dictionaries/en-US.json').then((m) => m.default as unknown as Dictionary),
  'es-ES': () => import('../dictionaries/es-ES.json').then((m) => m.default as unknown as Dictionary),
  'pt-BR': () => import('../dictionaries/pt-BR.json').then((m) => m.default as unknown as Dictionary),
};

/**
 * Recupera el diccionario de traducciones validado por el contrato de Zod.
 * 
 * @param {Locale} locale - El código de idioma resuelto por el middleware.
 * @returns {Promise<Dictionary>} El objeto de mensajes para la UI.
 * @throws {Error} Si el diccionario base (SSoT) no es localizable.
 * 
 * @example
 * const dict = await getDictionary('es-ES');
 */
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  // Protocolo Heimdall: Inicio de trazabilidad de carga de contenido
  try {
    const loader = dictionaryLoaders[locale] ?? dictionaryLoaders[i18n.defaultLocale];
    
    return await loader();
  } catch (error) {
    /**
     * ESTRATEGIA DE RESILIENCIA (Fail-Safe):
     * Si falla la carga del idioma solicitado (ej. corrupción de red o archivo),
     * forzamos la carga del idioma por defecto definido en i18n.config.
     */
    console.error(`[HEIMDALL][DIAGNOSIS] Fallo cargando diccionario [${locale}]:`, error);

    // Si el error ocurrió en un idioma que no es el default, intentamos rescatar la sesión.
    if (locale !== i18n.defaultLocale) {
      console.warn(`[HEIMDALL][RECOVERY] Activando rescate tipográfico hacia: ${i18n.defaultLocale}`);
      return await dictionaryLoaders[i18n.defaultLocale]();
    }

    // Si falla incluso el idioma base, el sistema debe emitir un error crítico.
    throw new Error(
      `[CRITICAL] SSoT Failure: El diccionario base [${i18n.defaultLocale}] es inaccesible.`
    );
  }
};