export default {
  displayName: 'portfolio-web',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  rootDir: '.',

  roots: [
    '<rootDir>/src',
    '<rootDir>/../../tests/apps/portfolio-web'
  ],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // --- CORRECCIÓN CRÍTICA: TRANSFORMACIÓN DE DEPENDENCIAS ESM ---
  transformIgnorePatterns: [
    "node_modules/(?!.*(@faker-js|msw|until-async))"
  ],
  // --------------------------------------------------------------

  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }]
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mapeo para paquetes internos
    '^@portfolio/testing-utils$': '<rootDir>/../../packages/testing-utils/src/index.ts',
    '^@razpodesta/protocol-33$': '<rootDir>/../../packages/protocol-33/src/index.ts'
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/portfolio-web',
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
};
