/**
 * @file packages/identity-gateway/eslint.config.mjs
 * @description Configuración soberana de calidad de código para el Identity Gateway.
 *              Refactorizado: Migración a Flat Config v9, eliminación de lógica 
 *              de Jest infiltrada y herencia del core del monorepo.
 * @version 2.0 - ESLint Flat Config Standard
 * @author Staff Engineer - MetaShark Tech
 */

import baseConfig from '../../eslint.config.mjs';

export default [
  // 1. Herencia de la Constitución de Calidad del Monorepo
  ...baseConfig,

  {
    // 2. Perímetro de Aplicación
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    
    /**
     * @pilar X: Configuración Segura. 
     * Definimos reglas específicas para la librería de identidad.
     */
    rules: {
      // Forzamos la pureza de los componentes de la pasarela
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
    // 3. Reglas Específicas para TypeScript (Sovereign Schemas)
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['packages/identity-gateway/tsconfig.json'],
      },
    },
    rules: {
      // Garantizamos que las promesas de Supabase/Server Actions sean manejadas
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },

  {
    // 4. Reglas para archivos de configuración e infraestructura
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },

  {
    // 5. Exclusiones de Perímetro
    ignores: ['dist/**', 'node_modules/**', '.next/**', 'test-output/**'],
  },
];