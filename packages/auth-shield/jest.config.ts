export default {
  displayName: '@razpodesta/auth-shield',
  preset: '../../jest.preset.js',
  testEnvironment: 'node', // Lógica pura de backend
  rootDir: '.',

  // 1. ARQUITECTURA ESPEJO (Patrón Ganador)
  roots: [
    '<rootDir>/src',
    '<rootDir>/../../tests/packages/auth-shield'
  ],

  // 2. TRANSFORMACIÓN DEFENSIVA
  transformIgnorePatterns: [
    "node_modules/(?!.*(@faker-js|msw|until-async))"
  ],

  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }]
  },

  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/auth-shield',
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts'
  ],
};
