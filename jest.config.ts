/**
 * @file jest.config.ts
 * @description Orquestador soberano de pruebas para el ecosistema MetaShark.
 *              Define los límites del "Espejo de Calidad" y la gestión de cobertura.
 * @version 7.0 - Elite Infrastructure Sync
 * @author Raz Podestá - MetaShark Tech
 */

export default {
  /**
   * @pilar I: Visión Holística.
   * Nombre identificador del monorepo para reportes integrados.
   */
  displayName: '@metashark/monorepo',
  
  /**
   * @pilar V: Herencia de Configuración.
   */
  preset: './jest.preset.js',

  /**
   * @pilar IV: Observabilidad (Heimdall).
   * Centralización de artefactos de cobertura en el directorio de reportes.
   */
  coverageDirectory: './test-output/jest/coverage',

  /**
   * @description Estrategia de búsqueda de pruebas.
   * Incluye tanto pruebas unitarias internas como el Espejo de Calidad (tests/).
   */
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
    '<rootDir>/tests/**/*(*.)@(spec|test).[jt]s?(x)'
  ],

  /**
   * @description Proyectos que Jest debe ignorar para evitar recursión.
   */
  projects: [
    '<rootDir>/apps/portfolio-web',
    '<rootDir>/packages/cms/core',
    '<rootDir>/packages/cms/ui',
    '<rootDir>/packages/protocol-33',
    '<rootDir>/packages/auth-shield',
    '<rootDir>/packages/testing-utils',
  ],
};