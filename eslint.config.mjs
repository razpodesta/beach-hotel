// RUTA: /eslint.config.mjs (RAÍZ DEL PROYECTO)
// VERSIÓN: Definitiva de Élite 4.0 ("Constitución del Monorepo")
// DESCRIPCIÓN: Se añade la exclusión de 'test-output' a la lista global de ignores
//              para asegurar que los reportes de cobertura de Jest no sean analizados.

import nxPlugin from '@nx/eslint-plugin';

export default [
  // --- CAPA 1: FUNDACIÓN Y CONFIGURACIONES BASE ---
  // Establece las reglas fundamentales de Nx para JavaScript y TypeScript en todo el monorepo.
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  ...nxPlugin.configs['flat/javascript'],

  // --- CAPA 2: EXCLUSIONES GLOBALES ---
  // Esta es la única fuente de verdad para los archivos y carpetas que NUNCA deben ser analizados.
  {
    ignores: [
        '**/node_modules',
        '**/dist',
        '**/.next',
        '**/.nx',
        '**/coverage',
        '**/test-output' // <-- MEJORA: Exclusión para los reportes de Jest.
    ],
  },

  // --- CAPA 3: EL GUARDIÁN DE LA ARQUITECTURA ---
  // Configuración centralizada para la regla más importante de un monorepo.
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
];
