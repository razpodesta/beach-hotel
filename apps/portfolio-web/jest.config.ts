/**
 * @file apps/portfolio-web/jest.config.ts
 * @description Orquestador de Pruebas de la App Web (The Quality Hub).
 *              Refactorizado: Sincronización total con la arquitectura v3.0, 
 *              inclusión del Identity Gateway y optimización del motor de 
 *              transformación SWC.
 * @version 5.0 - Source-First Resolution & Gateway Sync
 * @author Staff Engineer - MetaShark Tech
 */

export default {
  displayName: 'portfolio-web',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  rootDir: '.',

  /**
   * @pilar V: Arquitectura de Espejo.
   * Define los perímetros de búsqueda para el código fuente y sus reflejos.
   */
  roots: [
    '<rootDir>/src',
    '<rootDir>/../../tests/apps/portfolio-web'
  ],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  /**
   * @pilar X: Performance - SWC Transformation.
   * Delegamos la compilación JIT a SWC para máxima velocidad en CI/CD.
   */
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

  /**
   * @pilar III: Seguridad de Tipos y Transformación.
   * Lista blanca para paquetes ESM que requieren procesamiento antes de la ejecución.
   */
  transformIgnorePatterns: [
    'node_modules/(?!.*(@metashark|@payloadcms|payload|@faker-js|msw|until-async|react-icons))'
  ],

  /**
   * @pilar V: Adherencia Arquitectónica (Alias Sincronizados).
   * @description Mapeo soberano que redirige los alias a los puntos de entrada 
   *              vivos de cada paquete, garantizando el modo "Pure Source-First".
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // --- NÚCLEO DE DATOS ---
    '^@metashark/cms-core/config$': '<rootDir>/../../packages/cms/core/src/payload.config.ts',
    '^@metashark/cms-core$': '<rootDir>/../../packages/cms/core/src/index.ts',
    '^@metashark/cms-ui$': '<rootDir>/../../packages/cms/ui/src/index.ts',
    
    // --- LÓGICA COMPARTIDA ---
    '^@metashark/protocol-33$': '<rootDir>/../../packages/protocol-33/src/index.ts',
    '^@metashark/auth-shield$': '<rootDir>/../../packages/auth-shield/src/index.ts',
    
    // --- SEGURIDAD E INFRAESTRUCTURA ---
    '^@metashark/identity-gateway$': '<rootDir>/../../packages/identity-gateway/src/index.ts', // Sincronizado
    '^@metashark/testing-utils$': '<rootDir>/../../packages/testing-utils/src/index.ts',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coverageDirectory: '../../coverage/apps/portfolio-web',
  
  /**
   * @description Patrones de detección de pruebas.
   * Sincronizado con el Manifiesto de Pruebas v1.1.
   */
  testMatch: [
    '**/+(*.)+(spec|test).+(ts|js)?(x)'
  ],

  /**
   * @pilar VIII: Resiliencia.
   * Previene fallos en el grafo si no hay pruebas definidas en un nodo específico.
   */
  passWithNoTests: true,
};