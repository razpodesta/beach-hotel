/**
 * @file tests/eslint.config.mjs
 * @description Orquestador de Calidad para el Espejo de Calidad (Tests).
 * @version 2.0 - Identity Sync & Linter Pure
 */

import baseConfig from '../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/expect-expect': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' },
      ],
    },
  },
  {
    ignores: ['**/test-output/**', '**/coverage/**', '**/jest.setup.ts'],
  }
);