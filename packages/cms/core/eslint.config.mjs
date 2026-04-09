/**
 * @file packages/cms/core/eslint.config.mjs
 * @description Constitución de Calidad para el motor de datos (Sovereign Data Core).
 *              Refactorizado: Purga total de configuración de Testing (Manifiesto v1.1).
 *              Aislamiento: Enfocado exclusivamente en la integridad del CMS y Tipos.
 * @version 3.0 - Pure Data Node
 * @author Staff Engineer - MetaShark Tech
 */

import baseConfig from '../../../eslint.config.mjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. HERENCIA: Constitución Global
  ...baseConfig,

  // 2. PERÍMETRO DE DATOS (TypeScript Core)
  {
    files: ['src/**/*.ts'],
    rules: {
      // @pilar III: Seguridad de Tipos Absoluta en el Núcleo
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // Forzamos el uso de interfaces de Payload robustas
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },

  // 3. AISLAMIENTO DE INFRAESTRUCTRURA
  {
    ignores: ['**/out-tsc', '**/dist', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
  }
);