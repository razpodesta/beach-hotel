/**
 * @file packages/cms/ui/eslint.config.mjs
 * @description Constitución de Calidad para la librería de componentes compartidos.
 *              Refactorizado: Purga total de dependencias de Jest y archivos de prueba.
 *              Sincronización: Optimizado para React 19 y Oxygen UI Standards.
 * @version 3.0 - Pure UI Library
 * @author Staff Engineer - MetaShark Tech
 */

import baseConfig from '../../../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import nxPlugin from '@nx/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // 1. HERENCIA: Base del Monorepo y soporte React Nx
  ...baseConfig,
  ...nxPlugin.configs['flat/react'],

  // 2. PERÍMETRO DE INTERFAZ (React & Hooks)
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      
      // @pilar III: Seguridad de Tipos en Componentes
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // Integridad de la Experiencia (MEA/UX)
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'warn'
    },
  },

  // 3. PROTECCIÓN CONTRA ARCHIVOS HUÉRFANOS DE TEST
  {
    ignores: ['**/out-tsc', '**/dist', 'src/**/*.spec.tsx', 'src/**/*.test.tsx'],
  }
);