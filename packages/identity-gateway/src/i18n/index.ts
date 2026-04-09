/**
 * @file packages/identity-gateway/src/i18n/index.ts
 * @description Orquestador de Internacionalización Autónomo (The Polyglot Node).
 *              Gestiona los fallbacks de idioma y la mezcla de diccionarios
 *              bajo el estándar de Inversión de Control.
 *              Refactorizado: Erradicación de extensiones .js para compatibilidad 
 *              con resolución de módulos tipo "bundler".
 * @version 1.2 - Bundler Sync & Source Resolution Fixed
 * @author Staff Engineer - MetaShark Tech
 */

import { identityDictionarySchema, type IdentityDictionary } from '../schemas/auth.schema';

// Importaciones estáticas para garantizar disponibilidad inmediata
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import ptBR from './locales/pt-BR.json';

/**
 * CONFIGURACIÓN DE GLOBALIZACIÓN
 * @pilar I: Soberanía de Identidad.
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * MAPA SOBERANO DE LOCALES
 * @pilar III: Seguridad de Tipos Absoluta. 
 * Mapeo explícito para evitar inferencias laxas.
 */
const locales: Record<string, IdentityDictionary> = {
  'en-US': enUS as IdentityDictionary,
  'es-ES': esES as IdentityDictionary,
  'pt-BR': ptBR as IdentityDictionary,
};

/**
 * @function resolveIdentityDictionary
 * @description Mezcla el diccionario de la librería con los overrides del host.
 * @param {string} locale - Código de idioma solicitado (BCP 47).
 * @param {Partial<IdentityDictionary>} [overrides] - Inyección de control desde el host.
 * @returns {IdentityDictionary} Nodo de contenido validado y listo para render.
 */
export function resolveIdentityDictionary(
  locale: string = DEFAULT_LOCALE,
  overrides?: Partial<IdentityDictionary>
): IdentityDictionary {
  // 1. Resolución de Base con Fallback Determinista (Heimdall Pattern)
  const base = locales[locale] || locales[DEFAULT_LOCALE];
  
  // 2. Composición de Contenido (Inversión de Control)
  const merged = { ...base, ...overrides };

  // 3. Validación de Contrato SSoT (Sanity Check)
  const result = identityDictionarySchema.safeParse(merged);

  if (!result.success) {
    /**
     * @pilar IV: Observabilidad DNA-Level.
     * Reportamos la anomalía en el contrato sin interrumpir el flujo del huésped.
     */
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `%c[HEIMDALL][IDENTITY-GATEWAY] Dictionary drift detected in locale: ${locale}`,
        'color: #ffb86c; font-weight: bold;'
      );
    }
    
    // En caso de ruptura de esquema, servimos el nodo íntegro de seguridad.
    return locales[DEFAULT_LOCALE];
  }

  return result.data;
}