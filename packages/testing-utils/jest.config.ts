export default {
  displayName: '@portfolio/testing-utils',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  rootDir: '.',

  // 1. ARQUITECTURA ESPEJO
  roots: [
    '<rootDir>/src',
    '<rootDir>/../../tests/packages/testing-utils'
  ],

  // 2. CONFIGURACIÓN DEL SETUP
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // 3. TRANSFORMACIÓN DE DEPENDENCIAS
  transformIgnorePatterns: [
    "node_modules/(?!.*(@faker-js|msw|@mswjs|until-async))"
  ],

  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },

  // 4. MAPEO DE RUTAS (LIMPIO DE BACKEND)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../apps/portfolio-web/src/$1',
    '^@metashark-cms/ui$': '<rootDir>/../../packages/cms/ui/src/index.ts',
    '^@metashark-cms/core$': '<rootDir>/../../packages/cms/core/src/index.ts'
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/testing-utils',
  testMatch: [
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.test.ts',
    '**/*.test.tsx'
  ],
};
