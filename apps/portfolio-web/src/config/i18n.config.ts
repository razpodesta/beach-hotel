/**
 * @file Contrato Soberano de Internacionalización (i18n).
 * @version 6.0 - Inferencia Estricta y Type Guards Seguros.
 * @description Fuente única de verdad (SSoT) para los idiomas soportados en el ecosistema.
 * @author MetaShark Tech
 */

export const i18n = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es-ES'],
  cookieName: 'NEXT_LOCALE',
} as const;

/**
 * Tipo inferido de los locales permitidos.
 * Equivale a: 'pt-BR' | 'en-US' | 'es-ES'
 */
export type Locale = (typeof i18n)['locales'][number];

/**
 * Guarda de tipo (Type Guard) para verificar si una cadena es un locale válido.
 * Utiliza un casteo seguro a `readonly string[]` para evitar conflictos de
 * TypeScript al evaluar strings genéricos contra tuplas literales.
 *
 * @param {string} locale - La cadena de texto a evaluar.
 * @returns {boolean} Verdadero si la cadena es un idioma soportado.
 */
export const isValidLocale = (locale: string): locale is Locale => {
  return (i18n.locales as readonly string[]).includes(locale);
};

/**
 * Obtiene todos los idiomas configurados exceptuando el idioma actual.
 * Útil para construir enlaces alternativos (hreflang) o selectores de idioma en la UI.
 *
 * @param {Locale} currentLocale - El idioma actual que se desea excluir.
 * @returns {Locale[]} Un array con los idiomas restantes.
 */
export const getOtherLocales = (currentLocale: Locale): Locale[] => {
  return i18n.locales.filter((l) => l !== currentLocale);
};