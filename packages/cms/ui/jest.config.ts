/**
 * @file Configuración de Jest para @metashark-cms/ui.
 * @description Configuración de pruebas unitarias con soporte para JSDOM y MSW.
 * @version 2.1.0 - Cleaned for Frontend Repo
 */

export default {
  displayName: '@metashark-cms/ui',
  preset: '../../../jest.preset.js',
  testEnvironment: 'jsdom',
  rootDir: '.',

  // 1. ARQUITECTURA DE ESPEJO
  roots: [
    '<rootDir>/src',
    '<rootDir>/../../../tests/packages/cms/ui'
  ],

  // 2. CONFIGURACIÓN DEL SETUP
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // 3. TRANSFORMACIÓN DEFENSIVA
  transformIgnorePatterns: [
    "node_modules/(?!.*(@faker-js|msw|until-async))"
  ],

  // 4. TRANSFORMADOR SWC
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }]
  },

  // 5. MAPEO DE RUTAS (Limpio de backend)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../../apps/portfolio-web/src/$1',
    '^@portfolio/testing-utils$': '<rootDir>/../../../packages/testing-utils/src/index.ts',
    '^@metashark-cms/ui$': '<rootDir>/../../../packages/cms/ui/src/index.ts',
    '^@metashark-cms/core$': '<rootDir>/../../../packages/cms/core/src/index.ts'
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/cms/ui',
  testMatch: [
    '**/*.spec.ts',
    '**/*.spec.tsx'
  ],
};
