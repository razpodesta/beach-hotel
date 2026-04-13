/**
 * @file packages/communication-dispatch-hub/eslint.config.mjs
 * @description Configuración de calidad para el Nodo de Comunicaciones.
 * @version 1.1 - Syntax Error Fixed
 */

import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Reglas específicas del Silo D si fueran necesarias
    },
  },
  {
    // Aislamiento de compilación
    ignores: ['**/dist', '**/out-tsc'],
  },
];