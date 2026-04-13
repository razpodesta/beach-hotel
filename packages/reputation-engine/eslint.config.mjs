/**
 * @file packages/reputation-engine/eslint.config.mjs
 * @description Constitución de Calidad Estática para el motor de Reputación.
 *              Refactorizado: Sincronía con React 19 y pureza arquitectónica.
 *              Versión 3.0 - Reputation Engine Standard (MES Compliant)
 * @author Staff Engineer - MetaShark Tech
 */

import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  // 1. Herencia y Soporte de Interfaz
  ...baseConfig,
  ...nx.configs['flat/react'],

  {
    // 2. Perímetro de Desarrollo (Lógica Pura de Dominio)
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // @pilar III: Seguridad de Tipos en el Códice de Reputación
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // Integridad de la Experiencia (MEA/UX)
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'warn'
    },
  },

  {
    // 3. Aislamiento de Infraestructura de Build
    ignores: [
      '**/out-tsc', 
      '**/dist', 
      '**/node_modules'
    ],
  },
];