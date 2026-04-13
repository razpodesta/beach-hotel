/**
 * @file jest.preset.js (Root)
 * @description Orquestador de Transmutación JIT para el Espejo de Calidad.
 *              Versión 7.0 - Source-First Resolution & SWC Performance Hub.
 * 
 * @pilar V: Adherencia Arquitectónica - Sincronía dinámica con la Constitución de Caminos.
 * @pilar X: Performance - Delegación total al compilador SWC (Next.js 15 Parity).
 * @pilar XII: MEA/UX - Soporte nativo para React 19 y transformaciones asíncronas.
 */

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  ...require('@nx/jest/preset').default,

  /**
   * @description Resolución Neuronal de Caminos.
   * Transforma automáticamente los alias del 'tsconfig.base.json' en reglas de Jest.
   * El prefijo compensa la profundidad de los nodos (apps/ o packages/).
   */
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/../../',
    }),
    /**
     * @fix: Escudo de Activos (Asset Shield).
     * Evita que Jest intente procesar binarios o estilos como código JavaScript,
     * redirigiéndolos a un objeto vacío inofensivo.
     */
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/../../testing/mocks/file-mock.js',
  },

  /**
   * @description Motor de Síntesis SWC (High Fidelity).
   * Empata el comportamiento de Next.js 15 para garantizar que el código
   * se comporte idénticamente en el test y en el navegador del huésped.
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
            dynamicImport: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
              refresh: false, // Incompatible con Jest
            },
          },
          // Sincronía con el Estándar ES2022 definido en la raíz
          target: 'es2022',
        },
      },
    ],
  },

  /**
   * @description Configuración de Resiliencia y Reportes.
   */
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['text-summary', 'lcov', 'html'],
  
  /**
   * @pilar VIII: Resiliencia de Build.
   * Evita el bloqueo del pipeline por falta de cobertura en nodos en construcción.
   */
  passWithNoTests: true,

  /**
   * @fix: ESM Boundary Guard.
   * Instruye al motor para no intentar transpilar módulos que ya son ESM puros,
   * reduciendo el consumo de memoria en el runner.
   */
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};