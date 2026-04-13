/**
 * @file jest.config.ts (Root)
 * @description Orquestador Maestro de Pruebas (The Quality Mirror Hub).
 *              Versión 10.0 - Lego Infrastructure & Async Discovery Engine.
 * 
 * @pilar I: Visión Holística - Punto de entrada único para la validación del ecosistema.
 * @pilar V: Adherencia Arquitectónica - Sincronía total con el Espejo de Calidad.
 * @pilar IX: Desacoplamiento - Delegación del grafo de proyectos a Nx.
 * @pilar X: Performance - Resolución paralela de configuraciones de proyecto.
 */

import { getJestProjectsAsync } from '@nx/jest';

/**
 * @function rootJestConfig
 * @description Factoría de configuración asíncrona innegociable para MetaShark Tech.
 */
export default async () => ({
  /**
   * @description Identificador único para el reporte consolidado de auditoría.
   */
  displayName: '@metashark/monorepo-validator',
  
  /**
   * @description Herencia de transformaciones SWC y mapeos de la Constitución de Caminos.
   */
  preset: './jest.preset.js',

  /**
   * @description Centralización de artefactos de cobertura (SSoT de Calidad).
   * Facilita la inyección de reportes en herramientas de auditoría externa.
   */
  coverageDirectory: './test-output/jest/coverage',

  /**
   * @description Estrategia de búsqueda de especificaciones (The Mirror Logic).
   * 1. Busca tests internos en apps y paquetes (Unitarios).
   * 2. Busca tests en la carpeta raíz /tests (Integración / Espejo).
   */
  testMatch: [
    '<rootDir>/apps/**/*(*.)@(spec|test).[jt]s?(x)',
    '<rootDir>/packages/**/*(*.)@(spec|test).[jt]s?(x)',
    '<rootDir>/tests/**/*(*.)@(spec|test).[jt]s?(x)'
  ],

  /**
   * @description Matriz Dinámica de Proyectos.
   * @pilar IX: Inversión de Control.
   * Nx descubre automáticamente todos los jest.config.ts de los 12 nuevos nodos,
   * incluyendo 'identity-access-management' y 'reputation-engine' renombrados.
   */
  projects: await getJestProjectsAsync(),

  /**
   * @pilar VIII: Resiliencia de Infraestructura.
   * Evita el colapso del pipeline si un nodo del grafo aún es una cáscara sin tests.
   */
  passWithNoTests: true,

  /**
   * @description Reporte de ejecución.
   */
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-output/jest',
        outputName: 'results.xml',
      },
    ],
  ],
});