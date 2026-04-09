/**
 * @file packages/identity-gateway/src/i18n/index.ts
 * @description Orquestador de Internacionalización Autónomo.
 *              Gestiona los fallbacks de idioma y la mezcla de diccionarios
 *              bajo el estándar de Inversión de Control y pureza de tipos.
 *              Refactorizado: Erradicación de 'any' y cumplimiento de ESM estricto.
 * @version 1.1 - Linter Pure & Type Safe
 * @author Raz Podestá - MetaShark Tech
 */

import { identityDictionarySchema, type IdentityDictionary } from '../schemas/auth.schema.js';

// Importaciones estáticas para garantizar disponibilidad inmediata
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import ptBR from './locales/pt-BR.json';

const DEFAULT_LOCALE = 'en-US';

/**
 * MAPA SOBERANO DE LOCALES
 * @pilar III: Seguridad de Tipos Absoluta. Eliminamos 'any' en favor del contrato IdentityDictionary.
 */
const locales: Record<string, IdentityDictionary> = {
  'en-US': enUS as IdentityDictionary,
  'es-ES': esES as IdentityDictionary,
  'pt-BR': ptBR as IdentityDictionary,
};

/**
 * @function resolveIdentityDictionary
 * @description Mezcla el diccionario proporcionado por el usuario con el fallback local.
 * @param {string} locale - Código de idioma solicitado.
 * @param {Partial<IdentityDictionary>} [overrides] - Diccionario parcial inyectado por el host.
 * @returns {IdentityDictionary} Diccionario validado y completo listo para la UI.
 */
export function resolveIdentityDictionary(
  locale: string = DEFAULT_LOCALE,
  overrides?: Partial<IdentityDictionary>
): IdentityDictionary {
  // 1. Resolución de Base con Fallback Determinista
  const base = locales[locale] || locales[DEFAULT_LOCALE];
  
  // 2. Composición de Contenido (Inversión de Control)
  // El host tiene prioridad absoluta sobre los textos de la librería.
  const merged = { ...base, ...overrides };

  // 3. Validación de Contrato SSoT (Heimdall Guard)
  const result = identityDictionarySchema.safeParse(merged);

  if (!result.success) {
    /**
     * @pilar IV: Observabilidad DNA-Level.
     * Reportamos la anomalía estructural sin detener el hilo de ejecución del usuario.
     */
    console.warn(
      `%c[HEIMDALL][IDENTITY-GATEWAY] Dictionary Contract Violation in locale: ${locale}`,
      'color: #ffb86c; font-weight: bold;'
    );
    
    // En caso de desincronización, retornamos el nodo íntegro por defecto.
    return locales[DEFAULT_LOCALE];
  }

  return result.data;
}