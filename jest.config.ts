/**
 * @file jest.config.ts
 * @description Orquestador Maestro de Pruebas (The Quality Mirror Hub).
 *              Refactorizado: Migración a "Async Configuration" para compatibilidad 
 *              con Nx 22+ y resolución del error de tipos TS2724.
 *              Soberanía: Delegación total del descubrimiento de proyectos al 
 *              motor dinámico de Nx para evitar registros huérfanos.
 * @version 9.0 - Async Discovery & SSoT Project Mapping
 * @author Staff Engineer - MetaShark Tech
 */

import { getJestProjectsAsync } from '@nx/jest';

/**
 * @function rootJestConfig
 * @description Factoría de configuración asíncrona para Jest.
 * @pilar X: Performance - Permite que Nx resuelva el grafo de proyectos en paralelo.
 */
export default async () => ({
  /**
   * @pilar I: Visión Holística.
   * Identificador único para el reporte consolidado del monorepo.
   */
  displayName: '@metashark/monorepo',
  
  /**
   * @pilar V: Adherencia Arquitectónica.
   * Hereda las transformaciones SWC y mapeos de alias del preset central.
   */
  preset: './jest.preset.js',

  /**
   * @pilar IV: Observabilidad (Heimdall).
   * Los artefactos de cobertura se centralizan para auditorías de CI/CD.
   */
  coverageDirectory: './test-output/jest/coverage',

  /**
   * @description Estrategia de búsqueda de especificaciones.
   * Mantiene soporte para el "Espejo de Calidad" y pruebas atómicas internas.
   */
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
    '<rootDir>/tests/**/*(*.)@(spec|test).[jt]s?(x)'
  ],

  /**
   * @description Matriz Dinámica de Proyectos.
   * @pilar IX: Desacoplamiento de Infraestructura.
   * @fix TS2724: Uso de la API asíncrona requerida por Nx 22.
   * Eliminamos la lista manual para que Nx descubra automáticamente 
   * todos los jest.config.ts (incluyendo el nuevo identity-gateway).
   */
  projects: await getJestProjectsAsync(),

  /**
   * @pilar VIII: Resiliencia de Infraestructura.
   * Evita fallos si un nodo del grafo aún no posee archivos de prueba.
   */
  passWithNoTests: true,
});