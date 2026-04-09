/**
 * @file packages/auth-shield/eslint.config.mjs
 * @description Configuración de calidad para el escudo criptográfico.
 *              Refactorizado: Endurecimiento de tipos y validación de integridad.
 * @version 2.0 - Strict Logic Standard
 * @author Staff Engineer - MetaShark Tech
 */

import baseConfig from '../../eslint.config.mjs';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // 1. Herencia de la Constitución
  ...baseConfig,

  {
    // 2. Perímetro de Lógica: Erradicación de Deuda Técnica
    files: ['**/*.ts', '**/*.js'],
    rules: {
      // En un escudo de seguridad, el tipo 'any' es una vulnerabilidad crítica.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    },
  },

  {
    // 3. Validación de Integridad de Dependencias (JsonC)
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
        },
      ],
    },
    languageOptions: {
      parser: jsoncParser,
    },
  },

  {
    // 4. Limpieza de Artefactos de Compilación
    ignores: ['**/out-tsc', '**/dist'],
  },
];