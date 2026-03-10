export default {
  displayName: '@metashark-cms/core',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  rootDir: '.',

  // 1. ARQUITECTURA ESPEJO
  roots: [
    '<rootDir>/src',
    '<rootDir>/../../../tests/packages/cms/core'
  ],

  // 2. TRANSFORMACIÓN DEFENSIVA
  transformIgnorePatterns: [
    "node_modules/(?!.*(@faker-js|msw|until-async))"
  ],

  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }]
  },

  // 3. MAPEO MANUAL DE RUTAS (Limpio de backend)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../../apps/portfolio-web/src/$1',
    '^@portfolio/testing-utils$': '<rootDir>/../../../packages/testing-utils/src/index.ts',
    '^@metashark-cms/ui$': '<rootDir>/../../../packages/cms/ui/src/index.ts',
    '^@metashark-cms/core$': '<rootDir>/../../../packages/cms/core/src/index.ts'
  },

  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/cms/core',
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts'
  ],
};
