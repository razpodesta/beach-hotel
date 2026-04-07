/**
 * @file eslint.config.mjs
 * @description Constitución de Calidad Estática y Gobernanza del Monorepo.
 *              Refactorizado para Build-Time Isolation y Boundary Compliance.
 *              Implementa:
 *              1. Definición estricta de Scopes reales (metashark, cms, shared).
 *              2. Permisos explícitos para dependencias inter-capa (gamification, security).
 *              3. Blindaje del Espejo de Calidad (Tests).
 * @version 6.0 - Sovereign Frontier Standard (Tag Sync Edition)
 * @author Raz Podestá - MetaShark Tech
 */

import nxPlugin from '@nx/eslint-plugin';

export default [
  // --- CAPA 1: FUNDACIÓN ---
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  ...nxPlugin.configs['flat/javascript'],

  // --- CAPA 2: EXCLUSIONES GLOBALES ---
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/.next',
      '**/.nx',
      '**/coverage',
      '**/test-output',
      '**/tmp',
      '**/*.d.ts'
    ],
  },

  // --- CAPA 3: EL GUARDIÁN DE LA ARQUITECTURA (FRONTERAS SOBERANAS) ---
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          // Autorización explícita para dependencias fundamentales del ecosistema
          allow: ['react', 'react-dom', 'next', 'payload', 'zod', 'framer-motion'],
          depConstraints: [
            // 1. FRONTEND WEB (App)
            // Sincronizado con project.json -> "tags": ["scope:metashark"]
            {
              sourceTag: 'scope:metashark',
              onlyDependOnLibsWithTags: [
                'scope:shared', 
                'scope:cms',
                'layer:data', 
                'layer:security', 
                'layer:presentation',
                'layer:gamification',
                'layer:infrastructure'
              ],
            },
            // 2. NÚCLEO CMS (Data & UI)
            // Sincronizado con project.json -> "tags": ["scope:cms"]
            {
              sourceTag: 'scope:cms',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:cms',          // Permite la comunicación entre cms-core y cms-ui
                'layer:data',
                'layer:security',     // Requerido por cms-core para auth-shield
                'layer:gamification', // Requerido por cms-core para protocol-33
                'layer:presentation'
              ],
            },
            // 3. LIBRERÍAS COMPARTIDAS (Shared)
            // Sincronizado con project.json -> "tags": ["scope:shared"]
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'layer:infrastructure',
                'layer:security',
                'layer:gamification',
                'layer:util'
              ],
            },
            // 4. ESPEJO DE CALIDAD (Tests)
            // Permite que la infraestructura de testing audite cualquier capa
            {
              sourceTag: 'scope:tests',
              onlyDependOnLibsWithTags: [
                'scope:metashark',
                'scope:cms',
                'scope:shared',
                'type:testing'
              ],
            }
          ],
        },
      ],
    },
  },
];