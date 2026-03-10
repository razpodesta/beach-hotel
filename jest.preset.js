// RUTA: jest.preset.js
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  ...require('@nx/jest/preset').default,
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest', {
      jsc: {
        parser: { syntax: 'typescript', tsx: true },
        transform: { react: { runtime: 'automatic' } },
      },
      swcrc: false,
    }],
  },
  // CORRECCIÓN MAESTRA: Offset para proyectos a 2 niveles de profundidad
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../../',
  }),
  coverageReporters: ['html', 'text'],
  passWithNoTests: true,
};
