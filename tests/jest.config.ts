export default {
  displayName: 'tests',
  preset: '../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../apps/portfolio-web/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../apps/portfolio-web/src/$1',
    '^@metashark/(.*)$': '<rootDir>/../packages/$1/src/index.ts'
  }
};