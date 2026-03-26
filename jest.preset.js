/**
 * @file jest.preset.js
 * @description Configuración base para el motor de pruebas del Monorepo.
 *              Implementa el Modo Source-First para Jest mediante transpilación JIT con SWC.
 * @version 6.0 - Staff Quality Standard
 * @author Raz Podestá - MetaShark Tech
 */

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  ...require('@nx/jest/preset').default,

  /**
   * @pilar V: Adherencia Arquitectónica.
   * Mapeo dinámico de alias basado en la Constitución Raíz.
   * El prefijo compensa la profundidad de carpetas de los subproyectos (apps/ o packages/).
   */
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../../',
  }),

  /**
   * @pilar X: Rendimiento de Élite.
   * Delegamos la transformación a @swc/jest para igualar el comportamiento 
   * de Next.js 15 y reducir tiempos de ejecución en CI/CD.
   */
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },

  /**
   * @description Configuración de Reportes y Resiliencia.
   */
  coverageReporters: ['html', 'text-summary'],
  passWithNoTests: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};