/**
 * @file tests/jest.config.ts
 * @description Orquestador del Espejo de Calidad (Root Test Hub).
 *              Versión 9.0 - Full Node Mapping & MES Compliance.
 *              
 * @pilar V: Adherencia Arquitectónica - Mapeo 1:1 con la Constitución de Caminos.
 * @pilar IX: Desacoplamiento - Resolución Source-First para el motor de pruebas.
 * @pilar X: Performance - Transpilación JIT ultra-rápida vía SWC.
 */

export default {
  /**
   * @description Identificador único para el reporte consolidado de validación.
   */
  displayName: 'mirror-tests-hub',
  
  preset: '../jest.preset.js',
  testEnvironment: 'jsdom',

  /**
   * @description Sincronización de entorno de servidor/cliente.
   * Reutiliza los polyfills de infraestructura de la aplicación principal.
   */
  setupFilesAfterEnv: ['<rootDir>/../apps/portfolio-web/jest.setup.ts'],

  /**
   * @pilar V: Mapeo de Módulos de Alta Fidelidad.
   * @description Red de resolución neuronal. Asegura que los tests no utilicen 
   *              archivos compilados, sino el código fuente vivo de cada Silo.
   */
  moduleNameMapper: {
    // 1. APLICACIÓN PRINCIPAL
    '^@/(.*)$': '<rootDir>/../apps/portfolio-web/src/$1',
    
    // 2. NÚCLEO DE DATOS (CMS)
    '^@metashark/cms-core/config$': '<rootDir>/../packages/cms/core/src/payload.config.ts',
    '^@metashark/cms-core$': '<rootDir>/../packages/cms/core/src/index.ts',
    '^@metashark/cms-ui$': '<rootDir>/../packages/cms/ui/src/index.ts',

    // 3. LÓGICA DE NEGOCIO (DOMAIN LAYER)
    '^@metashark/reputation-engine$': '<rootDir>/../packages/reputation-engine/src/index.ts',
    '^@metashark/revenue-engine$': '<rootDir>/../packages/revenue-engine/src/index.ts',
    '^@metashark/partner-management-system$': '<rootDir>/../packages/partner-management-system/src/index.ts',
    '^@metashark/hospitality-business-logic$': '<rootDir>/../packages/hospitality-business-logic/src/index.ts',
    '^@metashark/customer-relationship-logic$': '<rootDir>/../packages/customer-relationship-logic/src/index.ts',

    // 4. INFRAESTRUCTRURA Y SEGURIDAD (INFRA LAYER)
    '^@metashark/auth-shield$': '<rootDir>/../packages/auth-shield/src/index.ts',
    '^@metashark/identity-access-management-management$': '<rootDir>/../packages/identity-access-management/src/index.ts',
    '^@metashark/communication-dispatch-hub$': '<rootDir>/../packages/communication-dispatch-hub/src/index.ts',
    '^@metashark/data-ingestion-service$': '<rootDir>/../packages/data-ingestion-service/src/index.ts',
    '^@metashark/seo-metadata-orchestrator$': '<rootDir>/../packages/seo-metadata-orchestrator/src/index.ts',
    '^@metashark/internationalization-registry$': '<rootDir>/../packages/internationalization-registry/src/index.ts',
    '^@metashark/storage-adapter-layer$': '<rootDir>/../packages/storage-adapter-layer/src/index.ts',
    '^@metashark/telemetry-observability-service$': '<rootDir>/../packages/telemetry-observability-service/src/index.ts',

    // 5. PRESENTACIÓN (UI LAYER)
    '^@metashark/shared-design-system$': '<rootDir>/../packages/shared-design-system/src/index.ts',
    '^@metashark/webgl-rendering-engine$': '<rootDir>/../packages/webgl-rendering-engine/src/index.ts',

    // 6. CALIDAD
    '^@metashark/testing-utils$': '<rootDir>/../packages/testing-utils/src/index.ts',
  },

  /**
   * @description Motor de transformación atómica.
   * Utiliza SWC para igualar la velocidad de compilación de Next.js 15.
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
   * @pilar VIII: Resiliencia.
   * Permite que el pipeline de CI/CD continúe incluso si un nodo 
   * aún no posee especificaciones de prueba.
   */
  passWithNoTests: true,
};