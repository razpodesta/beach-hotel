/* eslint-disable */
export default {
  displayName: '@razpodesta/protocol-33',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  rootDir: '.',

  // 1. ARQUITECTURA ESPEJO
  roots: [
    '<rootDir>/src',
    '<rootDir>/../../tests/packages/protocol-33'
  ],

  // 2. TRANSFORMACIÓN DEFENSIVA (Patrón Ganador)
  transformIgnorePatterns: [
    "node_modules/(?!.*(@faker-js|msw|until-async))"
  ],

  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }]
  },

  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/protocol-33',
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts'
  ],
};
