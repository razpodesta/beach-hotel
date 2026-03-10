// RUTA: apps/portfolio-web/src/lib/get-dictionary.ts
// VERSIÓN: 5.0 - Aislamiento forzado para Server Components
import 'server-only';
import type { Locale } from '@/config/i18n.config';
import type { Dictionary } from './schemas/dictionary.schema';

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  // Usamos import dinámico para asegurar que el contenido no entre en el bundle de cliente
  const dictionaries = {
    'en-US': () => import('../dictionaries/en-US.json'),
    'es-ES': () => import('../dictionaries/es-ES.json'),
    'pt-BR': () => import('../dictionaries/pt-BR.json'),
  };

  const loader = dictionaries[locale] || dictionaries['pt-BR'];
  const module = await loader();
  return module.default as Dictionary;
};