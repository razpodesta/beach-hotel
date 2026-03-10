// RUTA: /packages/cms/core/eslint.config.mjs
// VERSIÓN: 2.0 ("Guardián del Núcleo")
// DESCRIPCIÓN: Se completa la configuración para añadir la validación de
//              archivos de prueba con Jest, asegurando la fiabilidad de las
//              utilidades compartidas.

import baseConfig from '../../../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  // 1. HERENCIA: Hereda la configuración base del monorepo.
  ...baseConfig,

  // 2. CONFIGURACIÓN DE TYPESCRIPT: Aplica reglas al código fuente de la librería.
  {
    files: ['src/**/*.ts'],
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },

  // 3. CAPA DE PRUEBAS (JEST): Configuración para los tests de las funciones core.
  {
    files: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
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

  // 4. REGLAS PARA JSON (si es necesario):
  {
    files: ['**/*.json'],
    rules: {},
  }
);
