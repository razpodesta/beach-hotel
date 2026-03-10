/**
 * @file apps/portfolio-web/src/lib/get-dictionary.ts
 * @description Orquestador de carga de diccionarios i18n. Implementa importaciones 
 *              dinámicas para optimizar el bundle y aislamiento de servidor.
 * @version 6.0
 * @author Raz Podestá - MetaShark Tech
 */

import 'server-only';
// CORRECCIÓN: Uso de ruta relativa para cumplir con @nx/enforce-module-boundaries
import type { Locale } from '../config/i18n.config';
import type { Dictionary } from './schemas/dictionary.schema';

/**
 * Mapa de cargadores de diccionarios.
 * Utiliza promesas de importación dinámica para permitir el tree-shaking 
 * y reducir la latencia de carga en el servidor.
 */
const dictionaries = {
  'en-US': () => import('../dictionaries/en-US.json').then((module) => module.default),
  'es-ES': () => import('../dictionaries/es-ES.json').then((module) => module.default),
  'pt-BR': () => import('../dictionaries/pt-BR.json').then((module) => module.default),
};

/**
 * Recupera el diccionario de traducciones para un idioma específico.
 * @param locale El código de idioma solicitado (validado por el middleware).
 * @returns Una promesa que resuelve al objeto Dictionary completo y tipado.
 * @throws Error si falla la carga del recurso JSON.
 */
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  try {
    const loader = dictionaries[locale] || dictionaries['pt-BR'];
    const data = await loader();
    
    return data as Dictionary;
  } catch (error) {
    // Protocolo Heimdall: Registro forense de fallo en carga de contenido crítico.
    console.error(`[i18n-Service] Fallo crítico cargando diccionario para: ${locale}`, error);
    
    // Fallback de emergencia al idioma soberano del hotel.
    if (locale !== 'pt-BR') {
      return dictionaries['pt-BR']() as Promise<Dictionary>;
    }
    
    throw new Error(`[i18n-Service] No se pudo cargar el diccionario base.`);
  }
};