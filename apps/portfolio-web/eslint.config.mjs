// RUTA: /apps/portfolio-web/eslint.config.mjs
// VERSIÓN: Definitiva 5.0 ("Guardián de la Vanguardia y las Pruebas")
// DESCRIPCIÓN: Se añade una nueva capa de configuración específica para Jest,
//              aplicando las reglas recomendadas por 'eslint-plugin-jest'
//              únicamente a los archivos de prueba.

import baseConfig from '../../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  // 1. HERENCIA: Hereda toda la configuración base de la raíz.
  ...baseConfig,

  // 2. CONFIGURACIÓN DE TYPESCRIPT: Aplica reglas recomendadas al código fuente.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },

  // 3. ESPECIALIZACIÓN DE NEXT.JS: Añade las reglas y plugins específicos para Next.js.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // 4. CAPA DE REACT HOOKS: Refuerza las reglas de los hooks.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
        'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },

  // 5. CAPA DE PRUEBAS (JEST): Aplica la configuración de Jest a los archivos de especificaciones.
  {
    files: ['specs/**/*.spec.ts', 'specs/**/*.spec.tsx'],
    plugins: {
        jest: jestPlugin,
    },
    rules: {
        ...jestPlugin.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      }
    }
  },

  // 6. ANULACIONES QUIRÚRGICAS: Excepciones para archivos de configuración.
  {
    files: ['next.config.js', 'postcss.config.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
