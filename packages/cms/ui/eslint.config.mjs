// RUTA: /packages/cms/ui/eslint.config.mjs
// VERSIÓN: 2.0 ("Guardián de la Reutilización")
// DESCRIPCIÓN: Se completa la configuración para añadir el refuerzo de las reglas
//              de React Hooks y la validación de archivos de prueba con Jest,
//              asegurando la máxima calidad para la librería de componentes compartidos.

import baseConfig from '../../../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import nxPlugin from '@nx/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  // 1. HERENCIA: Hereda la base del monorepo.
  ...baseConfig,

  // 2. CONFIGURACIÓN DE REACT: Utiliza la configuración recomendada de Nx para React.
  ...nxPlugin.configs['flat/react'],

  // 3. CAPA DE REACT HOOKS: Asegura el uso correcto de los hooks.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
        'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },

  // 4. CAPA DE PRUEBAS (JEST): Configuración para los tests de los componentes.
  {
    files: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
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

  // 5. REGLAS ADICIONALES/ANULACIONES: Espacio para futuras personalizaciones.
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
);
