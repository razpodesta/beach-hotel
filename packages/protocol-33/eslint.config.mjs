/**
 * @file packages/protocol-33/eslint.config.mjs
 * @description Configuración de calidad para el motor de gamificación y UI Kit.
 *              Refactorizado: Sincronía con React 19 y pureza arquitectónica.
 * @version 2.0 - Hybrid Engine Standard
 * @author Staff Engineer - MetaShark Tech
 */

import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  // 1. Herencia y Soporte de Interfaz
  ...baseConfig,
  ...nx.configs['flat/react'],

  {
    // 2. Perímetro de Desarrollo (Lógica + Componentes)
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // @pilar III: Seguridad de Tipos en el Códice de Gamificación
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // Integridad de Componentes React (MEA/UX)
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'warn'
    },
  },

  {
    // 3. Aislamiento de Infraestructura
    ignores: ['**/out-tsc', '**/dist', '**/node_modules'],
  },
];