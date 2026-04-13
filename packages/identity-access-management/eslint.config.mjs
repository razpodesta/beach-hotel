/**
 * @file packages/identity-access-management/eslint.config.mjs
 * @description Constitución de Calidad Estática para el módulo IAM.
 *              Refactorizado: Sincronización de rutas post-migración física.
 * @version 2.1 - IAM Path Synchronized & Rules of Hooks Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import baseConfig from '../../eslint.config.mjs';

export default [
  // 1. Herencia de la Constitución de Calidad del Monorepo
  ...baseConfig,

  {
    // 2. Perímetro de Aplicación (React & TypeScript)
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    
    /**
     * @pilar X: Configuración Segura. 
     * Refuerzo de pureza para la interfaz de seguridad.
     */
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    // 3. Reglas de Integridad de Tipos (Sovereign Security Handshake)
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        /**
         * @fix: Alineación con la nueva ruta física para el análisis de grafo.
         */
        project: ['packages/identity-access-management/tsconfig.json'],
      },
    },
    rules: {
      // Obligatorio para asegurar que las llamadas a Supabase Auth sean awaitadas
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },

  {
    // 4. Perímetro de Infraestructura
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },

  {
    // 5. Exclusiones de Perímetro y Higiene de Build
    ignores: [
      'dist/**', 
      'node_modules/**', 
      '.next/**', 
      'test-output/**',
      '**/out-tsc'
    ],
  },
];