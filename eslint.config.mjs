/**
 * @file eslint.config.mjs
 * @description Constitución de Calidad Estática y Gobernanza del Monorepo.
 *              Nivelado: Implementa exclusiones de reporte y excepciones de frontera 
 *              para la Arquitectura de Espejo (Tests).
 * @version 4.1 - Elite Quality Mirror Standard
 * @author Raz Podestá - MetaShark Tech
 */

import nxPlugin from '@nx/eslint-plugin';

export default [
  // --- CAPA 1: FUNDACIÓN Y CONFIGURACIONES BASE ---
  // Establece las reglas fundamentales de Nx para JavaScript y TypeScript.
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  ...nxPlugin.configs['flat/javascript'],

  // --- CAPA 2: EXCLUSIONES GLOBALES (RECURSOS E INFRAESTRUCTRURA) ---
  // Define los activos que el motor de análisis debe ignorar para optimizar el rendimiento.
  {
    ignores: [
        '**/node_modules',
        '**/dist',
        '**/.next',
        '**/.nx',
        '**/coverage',
        '**/test-output', // Reportes de cobertura de Jest
        '**/tmp'
    ],
  },

  // --- CAPA 3: EL GUARDIÁN DE LA ARQUITECTURA (FRONTERAS SOBERANAS) ---
  // Orquesta las reglas de dependencia entre aplicaciones y librerías.
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            // Regla General: Fomenta el desacoplamiento absoluto.
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
            /**
             * @pilar V: Excepción Técnica para el Espejo de Calidad.
             * Autoriza al dominio de pruebas (scope:tests) a importar desde las
             * plataformas de ejecución para realizar validaciones de integración.
             */
            {
              sourceTag: 'scope:tests',
              onlyDependOnLibsWithTags: ['*', 'platform:web', 'platform:api']
            }
          ],
        },
      ],
    },
  },
];