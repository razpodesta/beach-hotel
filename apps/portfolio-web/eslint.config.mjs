/**
 * @file apps/portfolio-web/eslint.config.mjs
 * @description Constitución de Calidad Estática para el orquestador Web.
 *              Refactorizado: Purga total de configuraciones de Testing (Jest).
 *              Cumplimiento: Manifiesto de Pruebas v1.1 (Aislamiento Arquitectónico).
 * @version 7.0 - Pure Source Isolation
 * @author Staff Engineer - MetaShark Tech
 */

import baseConfig from '../../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // 1. HERENCIA SOBERANA
  ...baseConfig,

  // 2. REGISTRO GLOBAL DE PLUGINS (Vercel Build Sync)
  {
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
  },

  // 3. CAPA DE CÓDIGO FUENTE (Next.js & React)
  // Responsabilidad Única: Calidad del Producto, no de las Pruebas.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      
      // Next.js 15 Routing Sync
      '@next/next/no-html-link-for-pages': 'off',
      
      // @pilar III: Seguridad de Tipos Absoluta
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
    },
  },

  // 4. ANULACIONES QUIRÚRGICAS (Config Files)
  {
    files: [
      'next.config.js', 
      'next.config.ts', 
      'postcss.config.js', 
      'tailwind.config.js'
    ],
    languageOptions: {
      parserOptions: {
        sourceType: 'script',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  }
);