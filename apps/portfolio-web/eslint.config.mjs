/**
 * @file apps/portfolio-web/eslint.config.mjs
 * @description Constitución de Calidad Estática para el orquestador Web.
 *              Refactorizado: Registro global de plugins para satisfacer el 
 *              analizador AST de Next.js 15 en Vercel (Mitigación de Warning).
 * @version 6.1 - Flat Config Global Sync
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

  // 2. REGISTRO GLOBAL DE PLUGINS (Vercel Build Sync)
  // @pilar V: Extraer la declaración de plugins al nivel superior permite 
  // que el CLI de Next.js detecte la presencia de '@next/next' sin emitir warnings.
  {
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
  },

  // 3. CAPA DE CÓDIGO FUENTE (Next.js & React)
  {
    files:['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      // Reglas Recomendadas de Next.js
      ...nextPlugin.configs.recommended.rules,
      
      // Reglas de Élite para Performance (LCP, CLS, INP)
      ...nextPlugin.configs['core-web-vitals'].rules,
      
      // Reglas de integridad de Hooks
      ...reactHooksPlugin.configs.recommended.rules,
      
      // Ajustes de Élite: Desactivamos la advertencia de links internos 
      // ya que Next.js 15 gestiona esto nativamente mediante App Router y tipado estricto.
      '@next/next/no-html-link-for-pages': 'off',
      
      // @pilar III: Seguridad de Tipos Absoluta.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars':['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // 4. CAPA DE PRUEBAS (Arquitectura de Espejo)
  {
    files:[
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

  // 5. ANULACIONES QUIRÚRGICAS (Config Files)
  {
    files:[
      'next.config.js', 
      'next.config.ts', 
      'postcss.config.js', 
      'tailwind.config.js'
    ],
    languageOptions: {
      parserOptions: {
        sourceType: 'script', // Estos archivos son consumidos en contexto Node.js
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  }
);