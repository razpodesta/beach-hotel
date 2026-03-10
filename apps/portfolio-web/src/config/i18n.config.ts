// RUTA: apps/portfolio-web/src/config/i18n.config.ts
// VERSIÓN: 5.2 - Configuración con Inferencia Estricta y Constantes de Ruta
// DESCRIPCIÓN: Añadimos un helper para validación de locales y facilitamos 
//              la lógica de redirección en el middleware.

export const i18n = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es-ES'],
  cookieName: 'NEXT_LOCALE',
} as const;

export type Locale = (typeof i18n)['locales'][number];

/**
 * Guarda de tipo para verificar si una cadena es un locale válido.
 * Útil para validaciones en middleware o helpers de navegación.
 */
export const isValidLocale = (locale: string): locale is Locale => {
  return i18n.locales.includes(locale as Locale);
};

/**
 * Helper para obtener todos los idiomas excepto el actual.
 * Útil para construir hreflang o selectores de idioma.
 */
export const getOtherLocales = (currentLocale: Locale): Locale[] => {
  return i18n.locales.filter((l) => l !== currentLocale);
};