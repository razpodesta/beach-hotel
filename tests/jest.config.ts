/**
 * @file tests/jest.config.ts
 * @description Orquestador del Espejo de Calidad (Root Test Hub).
 *              Refactorizado: Resolución de mapeos anidados para el Silo CMS y
 *              sincronización con el Identity Gateway.
 *              Garantiza que Nx procese el grafo de dependencias de forma determinista.
 * @version 8.0 - Project Mapping Hardened (Nx Discovery Fix)
 * @author Staff Engineer - MetaShark Tech
 */

export default {
  /**
   * @pilar I: Visión Holística.
   * Identificador para el hub de pruebas de integración y E2E.
   */
  displayName: 'mirror-tests-hub',
  
  /**
   * @pilar V: Adherencia Arquitectónica.
   */
  preset: '../jest.preset.js',
  testEnvironment: 'jsdom',

  /**
   * @pilar VIII: Resiliencia de Infraestructura.
   * Reutiliza el setup de la app principal para garantizar paridad de entorno.
   */
  setupFilesAfterEnv: ['<rootDir>/../apps/portfolio-web/jest.setup.ts'],

  /**
   * @pilar V: Mapeo de Módulos de Alta Fidelidad.
   * @description Define de forma explícita las fronteras para evitar fallos de 
   *              resolución en el plugin de Nx/Jest durante el análisis del grafo.
   */
  moduleNameMapper: {
    // 1. App Router Hub
    '^@/(.*)$': '<rootDir>/../apps/portfolio-web/src/$1',
    
    // 2. Núcleo CMS (Rutas Anidadas - Fix para wildcard genérico)
    '^@metashark/cms-core/config$': '<rootDir>/../packages/cms/core/src/payload.config.ts',
    '^@metashark/cms-core$': '<rootDir>/../packages/cms/core/src/index.ts',
    '^@metashark/cms-ui$': '<rootDir>/../packages/cms/ui/src/index.ts',
    
    // 3. Silos Lógicos y Seguridad
    '^@metashark/protocol-33$': '<rootDir>/../packages/protocol-33/src/index.ts',
    '^@metashark/auth-shield$': '<rootDir>/../packages/auth-shield/src/index.ts',
    '^@metashark/identity-gateway$': '<rootDir>/../packages/identity-gateway/src/index.ts',
    '^@metashark/testing-utils$': '<rootDir>/../packages/testing-utils/src/index.ts',
  },

  /**
   * @pilar X: Performance - SWC Transformation.
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

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  /**
   * @description Evita bloqueos en el pipeline si un nodo del espejo 
   *              aún no posee archivos de especificación.
   */
  passWithNoTests: true,
};