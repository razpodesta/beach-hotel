/**
 * @file apps/portfolio-web/eslint.config.mjs
 * @description Constitución de Calidad Estática para el orquestador Web.
 *              Integra reglas de Next.js Core Web Vitals, React Hooks y Jest.
 * @version 6.0 - Next.js 15 Stable Sync (Flat Config)
 * @author Raz Podestá - MetaShark Tech
 */

import baseConfig from '../../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  // 1. HERENCIA SOBERANA: Se asumen las reglas base del Monorepo Nx.
  ...baseConfig,

  // 2. CAPA DE CÓDIGO FUENTE (Next.js & React)
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      /* 
         @pilar V: Adherencia Arquitectónica.
         Vinculación directa del plugin para evitar colisiones de parsers.
      */
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Reglas Recomendadas de Next.js
      ...nextPlugin.configs.recommended.rules,
      // Reglas de Élite para Performance (LCP, CLS, INP)
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Reglas de integridad de Hooks
      ...reactHooksPlugin.configs.recommended.rules,
      
      // Ajustes de Élite: Desactivamos la advertencia de links internos 
      // ya que Next.js 15 gestiona esto nativamente mediante tipos.
      '@next/next/no-html-link-for-pages': 'off',
      
      // @pilar III: Seguridad de Tipos Absoluta.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // 3. CAPA DE PRUEBAS (Arquitectura de Espejo)
  {
    files: [
      '**/*.spec.ts', 
      '**/*.spec.tsx', 
      '**/*.test.ts', 
      '**/*.test.tsx'
    ],
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
      // @pilar X: Higiene en Tests.
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
    },
  },

  // 4. ANULACIONES QUIRÚRGICAS (Config Files)
  {
    files: ['next.config.js', 'postcss.config.js', 'tailwind.config.js'],
    languageOptions: {
      parserOptions: {
        sourceType: 'script', // Estos archivos son CommonJS en Node.js
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  }
);