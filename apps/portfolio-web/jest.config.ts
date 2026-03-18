/**
 * @file apps/portfolio-web/jest.config.ts
 * @description Orquestador de pruebas para la aplicación web.
 *              Nivelado para resolución unificada de módulos del Core.
 * @version 4.1 - Centralized Module Mapper
 * @author Raz Podestá - MetaShark Tech
 */

export default {
  displayName: 'portfolio-web',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  rootDir: '.',

  // @pilar V: Arquitectura de Espejo
  roots:[
    '<rootDir>/src',
    '<rootDir>/../../tests/apps/portfolio-web'
  ],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  /**
   * @pilar III: Seguridad de Tipos y Transformación.
   * Lista blanca para paquetes que deben ser procesados por SWC (ESM a CJS).
   */
  transformIgnorePatterns:[
    'node_modules/(?!.*(@metashark|@payloadcms|payload|@faker-js|msw|until-async))'
  ],

  transform: {
    '^.+\\.[tj]sx?$':[
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
   * @pilar V: Adherencia Arquitectónica (Alias Sincronizados).
   * Se elimina la ruta de 'collections' para forzar a Jest a importar
   * la configuración unificada directamente de la raíz del core.
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@metashark/cms-core/config$': '<rootDir>/../../packages/cms/core/src/payload.config.ts',
    '^@metashark/cms-core$': '<rootDir>/../../packages/cms/core/src/index.ts',
    '^@metashark/cms-ui$': '<rootDir>/../../packages/cms/ui/src/index.ts',
    '^@metashark/protocol-33$': '<rootDir>/../../packages/protocol-33/src/index.ts',
    '^@metashark/auth-shield$': '<rootDir>/../../packages/auth-shield/src/index.ts',
    '^@metashark/testing-utils$': '<rootDir>/../../packages/testing-utils/src/index.ts',
  },

  moduleFileExtensions:['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/portfolio-web',
  testMatch:['**/*.spec.ts', '**/*.spec.tsx'],
};